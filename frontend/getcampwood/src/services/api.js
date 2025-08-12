// services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Get user data from localStorage
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Set user data in localStorage
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  // Convenience: set both token and user
  setAuth(token, user) {
    this.setAuthToken(token);
    this.setUser(user);
  }

  // Convenience: clear auth (token + user)
  clearAuth() {
    this.removeAuthToken();
  }

  // Convenience: set both token a {
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // Make API request with auth header
  async apiRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making ${config.method || 'GET'} request to: ${url}`);
      
      const response = await fetch(url, config);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        data = { 
          success: false, 
          message: `Server returned non-JSON response: ${text}` 
        };
      }

      console.log(`Response status: ${response.status}`, data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      
      // Handle network errors or connection refused
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please make sure the backend is running on http://localhost:5000');
      }
      
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    try {
      const response = await this.apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success && response.token) {
        this.setAuthToken(response.token);
        this.setUser(response.user);
      }

      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async login(credentials) {
    try {
      const response = await this.apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.token) {
        this.setAuthToken(response.token);
        this.setUser(response.user);
      }

      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async logout() {
    try {
      if (this.isAuthenticated()) {
        await this.apiRequest('/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout - always clean up locally
    } finally {
      this.removeAuthToken();
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.apiRequest('/auth/me');
      
      if (response.success) {
        this.setUser(response.user);
        return response.user;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      this.removeAuthToken();
      return null;
    }
  }

  // Profile management methods
  async updateProfile(userData) {
    try {
      const response = await this.apiRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      if (response.success) {
        // Update stored user data with new information
        this.setUser(response.user);
      }

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await this.apiRequest('/user/change-password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });

      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  }

  async deleteAccount() {
    try {
      console.log('Attempting to delete account...');
      
      const response = await this.apiRequest('/user/account', {
        method: 'DELETE',
      });

      console.log('Delete account response:', response);

      if (response.success) {
        // Clear all stored auth data
        this.removeAuthToken();
        console.log('Account deleted successfully, auth data cleared');
      }

      return response;
    } catch (error) {
      console.error('Delete account error:', error);
      throw new Error(error.message || 'Failed to delete account');
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.apiRequest('/health');
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, message: 'API unavailable' };
    }
  }

  // Utility method to check if API is available
  async checkApiConnection() {
    try {
      const health = await this.healthCheck();
      console.log('API connection check:', health);
      return health.success;
    } catch (error) {
      console.error('API connection check failed:', error);
      return false;
    }
  }

  // Method to refresh user data
  async refreshUserData() {
    try {
      const user = await this.getCurrentUser();
      return user;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return null;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;