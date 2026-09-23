/**
 * UltraBase Client SDK
 * Easy Backend Integration for Web Applications
 */
class UltraBaseClient {
  constructor(baseUrl, apiKey = '') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;

    // Dedicated Auth Module
    this.auth = {
      // Sign Up with Email and Password
      signUp: async (email, password) => {
        try {
          const response = await fetch(`${this.baseUrl}/api/auth/signup`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password })
          });
          return await response.json();
        } catch (error) {
          return { success: false, message: error.message };
        }
      },

      // Log In with Email and Password
      logIn: async (email, password) => {
        try {
          const response = await fetch(`${this.baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password })
          });
          return await response.json();
        } catch (error) {
          return { success: false, message: error.message };
        }
      }
    };
  }

  // Helper method for headers
  getHeaders(customHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      'x-ultrabase-api-key': this.apiKey,
      ...customHeaders
    };
  }

  // Ping Server / Test SDK Connection
  async ping() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ping`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Quick Register User (By Email & Role)
  async register(email, role = 'user') {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, role })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Insert Data into Dynamic Table
  async insertData(tableName, data) {
    try {
      const response = await fetch(`${this.baseUrl}/api/db/data/${tableName}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get Data from Dynamic Table
  async getData(tableName) {
    try {
      const response = await fetch(`${this.baseUrl}/api/db/data/${tableName}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Submit UTR Payment
  async submitUTR(email, utr) {
    return await this.insertData('utr_payments', { email, utr, status: 'pending' });
  }

  // Upload File
  async uploadFile(fileInput) {
    try {
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      const response = await fetch(`${this.baseUrl}/api/storage/upload`, {
        method: 'POST',
        headers: {
          'x-ultrabase-api-key': this.apiKey
        },
        body: formData
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Function to initialize UltraBase
function createUltraBase(baseUrl, apiKey = '') {
  return new UltraBaseClient(baseUrl, apiKey);
      }
