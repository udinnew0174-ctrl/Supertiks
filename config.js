// config.js - Konfigurasi aplikasi (TikWM API langsung)
const CONFIG = {
    // Endpoint TikWM API (public)
    API_ENDPOINT: 'https://www.tikwm.com/api/',
    
    // Batas waktu request (30 detik)
    REQUEST_TIMEOUT: 30000,
    
    // Opsi fetch (TikWM menggunakan GET)
    FETCH_METHOD: 'GET'
};

// Ekspos ke global
window.APP_CONFIG = CONFIG;
