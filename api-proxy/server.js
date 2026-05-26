// Authentik REST Admin API express-proxy server
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Authentik Admin API settings loaded from secure environment variables
const AUTHENTIK_URL = process.env.AUTHENTIK_URL || 'http://authentik-server:9000';
const AUTH_TOKEN = process.env.AUTHENTIK_API_TOKEN || 'kQN665CvKdYR1yycvROb0UmtmK9WBjOT6ux3TwiROT8Tujq06MoYHQcuZ3mi';

// Group UUIDs mapped from Authentik configuration Phase 1
const ROLE_GROUPS = {
  owner: 'c5f89b55-c5d2-4864-80fe-e857652026e2',
  freelancer: '4cb86715-a913-45c9-b0d8-db3cd8d6a2c6',
  client: 'e878b752-875a-4e01-80b2-08057cca5bef'
};

app.use(cors());
app.use(express.json());

// Helper request wrapper to query Authentik API
async function akRequest(path, options = {}) {
  const url = `${AUTHENTIK_URL}${path}`;
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Authentik API error (${response.status}): ${errorBody}`);
  }
  
  return response.status !== 204 ? response.json() : null;
}

// 1. GET /api/employees - Lists all workspace employee accounts
app.get('/api/employees', async (req, res) => {
  try {
    // 1. Fetch users from Authentik
    const usersData = await akRequest('/api/v3/core/users/?page_size=200');
    const users = usersData.results || [];
    
    // 2. Fetch ak_groups mapping details for roles extraction
    const groupUsers = [];
    
    for (const u of users) {
      if (u.type === 'internal_service_account' || u.username === 'AnonymousUser') continue;
      
      // Determine in-workspace role based on ak_groups membership lists
      let role = 'freelancer';
      if (u.ak_groups_by_name) {
        if (u.ak_groups_by_name.includes('workspace-owner')) role = 'owner';
        else if (u.ak_groups_by_name.includes('workspace-client')) role = 'client';
      }
      
      // Filter out users who do not belong to any workspace groups
      const belongsToWorkspace = u.ak_groups_by_name && u.ak_groups_by_name.some(gname => 
        ['workspace-owner', 'workspace-freelancer', 'workspace-client'].includes(gname)
      );
      
      if (belongsToWorkspace) {
        groupUsers.push({
          id: u.pk,
          name: u.name || u.username,
          email: u.email || `${u.username}@tinhgon.com`,
          role: role,
          isActive: u.is_active,
          dateJoined: u.date_joined
        });
      }
    }
    
    res.json(groupUsers);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message || 'Error listing employee accounts' });
  }
});

// 2. POST /api/employees - Creates a new employee user + assigns group
app.post('/api/employees', async (req, res) => {
  const { email, name, role } = req.body;
  if (!email || !name) {
    return res.status(400).json({ message: 'Email and Name are required.' });
  }
  
  try {
    const username = email.split('@')[0] + '-' + Math.random().toString(36).substring(2, 6);
    
    // 1. Create OIDC user account in Authentik core
    const newAkUser = await akRequest('/api/v3/core/users/', {
      method: 'POST',
      body: JSON.stringify({
        username: username,
        name: name,
        email: email,
        is_active: true,
        path: 'users'
      })
    });
    
    const userId = newAkUser.pk;
    const targetGroupUuid = ROLE_GROUPS[role || 'freelancer'];
    
    // 2. Map user to the correct OIDC role group
    if (targetGroupUuid) {
      await akRequest(`/api/v3/core/groups/${targetGroupUuid}/users/`, {
        method: 'POST',
        body: JSON.stringify({ users: [userId] })
      });
    }
    
    res.status(201).json({
      id: userId,
      name: name,
      email: email,
      role: role || 'freelancer',
      isActive: true
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message || 'Error provisioning new employee account' });
  }
});

// 3. PATCH /api/employees/:id - Updates employee details
app.patch('/api/employees/:id', async (req, res) => {
  const userId = req.params.id;
  const { name, is_active } = req.body;
  
  try {
    const updateBody = {};
    if (name !== undefined) updateBody.name = name;
    if (is_active !== undefined) updateBody.is_active = is_active;
    
    const updatedUser = await akRequest(`/api/v3/core/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updateBody)
    });
    
    res.json({
      id: userId,
      name: updatedUser.name,
      isActive: updatedUser.is_active
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message || 'Error updating employee account' });
  }
});

// 4. PUT /api/employees/:id/role - Changes user group role mapping
app.put('/api/employees/:id/role', async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;
  
  if (!ROLE_GROUPS[role]) {
    return res.status(400).json({ message: 'Invalid role assignment' });
  }
  
  try {
    // 1. Remove user from all other workspace groups
    for (const groupKey in ROLE_GROUPS) {
      const groupUuid = ROLE_GROUPS[groupKey];
      try {
        await akRequest(`/api/v3/core/groups/${groupUuid}/users/`, {
          method: 'DELETE',
          body: JSON.stringify({ users: [parseInt(userId)] })
        });
      } catch (e) {
        // user might not be in this group, ignore error safely
      }
    }
    
    // 2. Add user to the new role group
    const targetGroupUuid = ROLE_GROUPS[role];
    await akRequest(`/api/v3/core/groups/${targetGroupUuid}/users/`, {
      method: 'POST',
      body: JSON.stringify({ users: [parseInt(userId)] })
    });
    
    res.json({ message: 'Role assigned successfully', role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message || 'Error changing employee role mapping' });
  }
});

// 5. DELETE /api/employees/:id - Removes user from workspace groups completely
app.delete('/api/employees/:id', async (req, res) => {
  const userId = req.params.id;
  
  try {
    // Remove user membership from all workspace role groups
    for (const groupKey in ROLE_GROUPS) {
      const groupUuid = ROLE_GROUPS[groupKey];
      try {
        await akRequest(`/api/v3/core/groups/${groupUuid}/users/`, {
          method: 'DELETE',
          body: JSON.stringify({ users: [parseInt(userId)] })
        });
      } catch (e) {
        // safe ignore
      }
    }
    
    // De-provision / deactivate account in Authentik
    await akRequest(`/api/v3/core/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: false })
    });
    
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message || 'Error de-provisioning employee account' });
  }
});

app.listen(PORT, () => {
  console.log(`Authentik express-proxy running on port ${PORT}`);
});
