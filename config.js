// config.js - Konfigurasi endpoint API dan pengaturan aplikasi
const CONFIG = {
    // Endpoint API download (handler Next.js Anda)
    API_ENDPOINT: '/api/download',
    
    // Batas waktu request dalam milidetik (30 detik)
    REQUEST_TIMEOUT: 30000,
    
    // Opsi fetch default
    FETCH_OPTIONS: {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    }
};

// Ekspos ke global scope
window.APP_CONFIG = CONFIG;
