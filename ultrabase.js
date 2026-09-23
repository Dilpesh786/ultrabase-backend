/**
 * UltraBase Client SDK v2.0
 * Powerful BaaS Client for Frontend Applications
 */
class UltraBaseClient {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    async ping() {
        const res = await fetch(`${this.baseUrl}/api/v1/ping`);
        return await res.json();
    }

    // Authentication Methods
    async signUp(email, password) {
        const res = await fetch(`${this.baseUrl}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await res.json();
    }

    async signIn(email, password) {
        const res = await fetch(`${this.baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('ub_token', data.token);
        }
        return data;
    }

    // Database Relational Table Methods
    async getTableRows(tableName) {
        const res = await fetch(`${this.baseUrl}/api/db/data/${tableName}`);
        return await res.json();
    }

    async insertRow(tableName, data) {
        const res = await fetch(`${this.baseUrl}/api/db/data/${tableName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    }

    // NoSQL Document Collection Methods (Firebase Style)
    async addDocument(collectionName, documentData) {
        const res = await fetch(`${this.baseUrl}/api/db/collection/${collectionName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(documentData)
        });
        return await res.json();
    }

    async getDocuments(collectionName) {
        const res = await fetch(`${this.baseUrl}/api/db/collection/${collectionName}`);
        return await res.json();
    }

    // Storage Bucket Methods
    async uploadFile(fileObject) {
        const formData = new FormData();
        formData.append('file', fileObject);
        const res = await fetch(`${this.baseUrl}/api/storage/upload`, {
            method: 'POST',
            body: formData
        });
        return await res.json();
    }
}

// Export for global usage
window.UltraBase = UltraBaseClient;
