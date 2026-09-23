/**
 * UltraBase Client SDK
 * Easy Backend Integration for Web Applications
 */
class UltraBaseClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  // 1. User Register
  async register(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 2. User Login
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 3. Submit UTR Payment
  async submitUTR(email, utr) {
    try {
      const response = await fetch(`${this.baseUrl}/api/submit-utr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, utr })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // 4. Upload File
  async uploadFile(fileInput) {
    try {
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      const response = await fetch(`${this.baseUrl}/api/upload`, {
        method: 'POST',
        body: formData
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Function to initialize UltraBase
function createUltraBase(baseUrl) {
  return new UltraBaseClient(baseUrl);
        }

