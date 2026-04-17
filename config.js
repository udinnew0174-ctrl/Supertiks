// config.js - Konfigurasi endpoint dan pengaturan aplikasi
const CONFIG = {
    // Endpoint API download (sesuaikan dengan environment Anda)
    API_ENDPOINT: '/api/download',
    
    // Batas waktu request (ms)
    REQUEST_TIMEOUT: 30000,
    
    // Opsi fetch default
    FETCH_OPTIONS: {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    }
};

// Jangan diubah, hanya untuk referensi global
window.APP_CONFIG = CONFIG;
