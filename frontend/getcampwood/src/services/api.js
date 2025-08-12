// src/services/api.js

// Using a single API URL for both auth and locations
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
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
  
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // Check if API is available
  async checkApiConnection() {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('API connection check failed:', error);
      return false;
    }
  }

  // Generic API request handler
  async apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
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
      const response = await fetch(url, config);
      
      // Handle empty responses (like 204 No Content)
      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`API request to ${url} failed:`, error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Unable to connect to the server at ${API_URL}. Please ensure the backend service is running.`);
      }
      throw error;
    }
  }

  // --- Auth & User Methods ---
  async register(userData) {
    const response = await this.apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.success && response.token) {
      this.setAuthToken(response.token);
      this.setUser(response.user);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.success && response.token) {
      this.setAuthToken(response.token);
      this.setUser(response.user);
    }
    return response;
  }

  async logout() {
    try {
      if (this.isAuthenticated()) {
        await this.apiRequest('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('Logout API call failed, logging out locally.', error);
    } finally {
      this.removeAuthToken();
    }
  }

  async getCurrentUser() {
    if (!this.isAuthenticated()) return null;
    try {
      const response = await this.apiRequest('/auth/me');
      if (response.success) {
        this.setUser(response.user);
        return response.user;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      this.removeAuthToken(); // Token is likely invalid
      return null;
    }
  }

  async updateProfile(userData) {
    const response = await this.apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    if (response.success) {
      this.setUser(response.user);
    }
    return response;
  }

  async deleteAccount() {
    const response = await this.apiRequest('/user/account', {
      method: 'DELETE',
    });
    if (response.success) {
      this.removeAuthToken();
    }
    return response;
  }

  // --- Location Methods ---
  
  /**
   * Fetches all firewood locations.
   * This is a public endpoint, so no auth is required.
   */
  async getLocations() {
    const response = await this.apiRequest('/locations');
    console.log('API getLocations response:', response);
    return response;
  }

  /**
   * Debug endpoint to check current user token
   */
  async debugCurrentUser() {
    if (!this.isAuthenticated()) {
      console.log('No auth token found');
      return null;
    }
    
    try {
      const response = await this.apiRequest('/auth/me');
      console.log('Debug current user response:', response);
      return response;
    } catch (error) {
      console.error('Debug current user error:', error);
      return null;
    }
  }

  /**
   * Adds a new firewood location.
   * This is a protected endpoint and requires authentication.
   * @param {object} locationData - { name, description, price, latitude, longitude }
   */
  async addLocation(locationData) {
    return this.apiRequest('/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  /**
   * Get a specific location by ID
   * @param {string} locationId - The location ID
   */
  async getLocation(locationId) {
    return this.apiRequest(`/locations/${locationId}`);
  }

  /**
   * Update a location (only by creator or admin)
   * @param {string} locationId - The location ID
   * @param {object} locationData - Updated location data
   */
  async updateLocation(locationId, locationData) {
    return this.apiRequest(`/locations/${locationId}`, {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  }

  /**
   * Delete a location (only by creator or admin)
   * @param {string} locationId - The location ID
   */
  async deleteLocation(locationId) {
    return this.apiRequest(`/locations/${locationId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get current user's locations
   */
  async getMyLocations() {
    return this.apiRequest('/locations/user/mine');
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    return this.apiRequest('/user/stats');
  }
}

const apiService = new ApiService();
export default apiService;