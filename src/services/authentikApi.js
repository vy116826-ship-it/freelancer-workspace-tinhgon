// Authentik Employee Administration Management API Service
const API_BASE = '/api/employees';

// Reads Authorization header from sessionStorage tokens
function getAuthHeader() {
  const token = sessionStorage.getItem('workspace_access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const authentikApiService = {
  // Lists all users belonging to workspace groups
  listEmployees: async () => {
    const response = await fetch(API_BASE, {
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch employee list');
    }
    return response.json();
  },

  // Creates a new employee user in Authentik
  createEmployee: async (employeeData) => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(employeeData)
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create new employee account');
    }
    return response.json();
  },

  // Updates an employee user details (e.g. status)
  updateEmployee: async (userId, updateData) => {
    const response = await fetch(`${API_BASE}/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) {
      throw new Error('Failed to update employee account');
    }
    return response.json();
  },

  // Assigns a role group to user, removing old workspace groups
  updateEmployeeRole: async (userId, newRole) => {
    const response = await fetch(`${API_BASE}/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ role: newRole })
    });
    if (!response.ok) {
      throw new Error('Failed to assign new role to employee');
    }
    return response.json();
  },

  // Deactivates/removes a user from workspace groups
  deleteEmployee: async (userId) => {
    const response = await fetch(`${API_BASE}/${userId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!response.ok) {
      throw new Error('Failed to delete employee account');
    }
    return response.ok;
  }
};
