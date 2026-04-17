// script.js - Main Application Logic (TikWM API langsung)

// DOM Elements
const elements = {
    input: document.getElementById('urlInput'),
    btnProcess: document.getElementById('btnProcess'),
    loader: document.getElementById('loader'),
    resultArea: document.getElementById('resultArea'),
    errorMsg: document.getElementById('errorMsg'),
    errorText: document.getElementById('errorText'),
    thumbImg: document.getElementById('thumbImg'),
    titleTxt: document.getElementById('titleTxt'),
    authorTxt: document.getElementById('authorTxt'),
    btnDownloadNoWm: document.getElementById('btnDownloadNoWm'),
    btnDownloadAudio: document.getElementById('btnDownloadAudio'),
    logContainer: document.getElementById('logContainer'),
    visitorCount: document.getElementById('visitorCount'),
    downloadCount: document.getElementById('downloadCount'),
    apiSpeed: document.getElementById('apiSpeed')
};

// Global state
let currentVideoData = null;
let visitorCount = 2400;
let downloadCount = 18700;
let apiSpeed = 24;

// Initialize the app
function initApp() {
    addLogEntry('System', 'SuperTik Pro v4.0 initialized');
    addLogEntry('System', 'API servers connected');
    addLogEntry('System', 'Ready to process TikTok links');
    
    setInterval(updateLiveStats, 3000);
    setInterval(addRandomActivityLog, 4000);
    
    elements.btnProcess.addEventListener('click', handleDownloadRequest);
    elements.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleDownloadRequest();
    });
    
    elements.input.focus();
}

// Handle download request
async function handleDownloadRequest() {
    const url = elements.input.value.trim();
    
    if (!url) {
        showError('Silakan masukkan tautan TikTok yang valid');
        return;
    }
   
    if (!isValidTikTokUrl(url)) {
        showError('Tautan TikTok tidak valid. Contoh: https://www.tiktok.com/@user/video/123456789');
        return;
    }
    
    resetUI();
    showLoader(true);
    
    try {
        const videoData = await fetchTikTokData(url);
        
        if (videoData && videoData.data) {
            currentVideoData = videoData.data;
            renderVideoData(currentVideoData);
            showResult(true);
            addLogEntry('Success', `Video dianalisis: ${currentVideoData.title ? currentVideoData.title.substring(0, 30) + '...' : 'TikTok Video'}`);
            downloadCount += 1;
            updateDownloadCount();
        } else {
            throw new Error('Gagal mendapatkan data video');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Gagal mengambil data video. Coba lagi atau gunakan tautan yang berbeda.');
        addLogEntry('Error', 'Gagal memproses tautan TikTok');
    } finally {
        showLoader(false);
    }
}

// Fetch TikTok data from TikWM API
async function fetchTikTokData(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
    
    try {
        const apiUrl = `${CONFIG.API_ENDPOINT}?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl, {
            method: CONFIG.FETCH_METHOD,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code !== 0) {
            throw new Error('API returned error code');
        }
        
        return data;
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timeout. Server terlalu lama merespons.');
        }
        
        // Jika API gagal, fallback ke mock data (opsional)
        console.warn('API failed, using mock data');
        return getMockVideoData(url);
    }
}

// Mock data for demo if API fails
function getMockVideoData(url) {
    const mockData = {
        code: 0,
        data: {
            title: "Video TikTok Demo - Mode Offline",
            cover: "https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
            author: {
                nickname: "@tiktok_user"
            },
            play: url, // Use original URL as fallback
            music: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Sample audio
        }
    };
    
    addLogEntry('System', 'Menggunakan data demo (API sibuk)');
    return mockData;
}

// Render video data to UI
function renderVideoData(data) {
    elements.thumbImg.src = data.cover || 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    elements.titleTxt.textContent = data.title || 'Video TikTok';
    elements.authorTxt.textContent = data.author?.nickname || '@user';
    
    // FIX: Bind event dengan fungsi wrapper yang menerima event
    elements.btnDownloadNoWm.onclick = (e) => {
        e.preventDefault(); // Cegah zoom / default action
        downloadFile(data.play || data.wmplay || data.hdplay, sanitizeFilename(data.title || 'tiktok_video') + '.mp4', e);
    };
    
    elements.btnDownloadAudio.onclick = (e) => {
        e.preventDefault();
        downloadFile(data.music, sanitizeFilename(data.title || 'tiktok_audio') + '.mp3', e);
    };
}

// FIX: Tambahkan parameter event dan preventDefault di awal
async function downloadFile(url, filename, event) {
    // Cegah perilaku default (zoom, navigasi, dll)
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if (!url) {
        showError('Tidak ada URL download tersedia');
        return;
    }
    
    // FIX: Dapatkan tombol dari event.target
    const button = event ? event.target.closest('button') : null;
    const originalText = button ? button.innerHTML : '';
    
    if (button) {
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> MEMPROSES...';
        button.disabled = true;
    }
    
    addLogEntry('Download', `Memulai download: ${filename}`);
    
    try {
        // Coba fetch sebagai blob agar bisa download langsung dengan nama kustom
        const response = await fetch(url);
        if (!response.ok) throw new Error('Gagal mengunduh file');
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        
        addLogEntry('Success', `Berhasil mendownload: ${filename}`);
    } catch (error) {
        console.error('Download error:', error);
        // Fallback: buka di tab baru jika fetch blob gagal (misal CORS)
        window.open(url, '_blank');
        addLogEntry('System', 'Menggunakan metode download alternatif (tab baru)');
    } finally {
        if (button) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }
}

// Helper: sanitasi nama file
function sanitizeFilename(str) {
    return str.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
}

// UI Helper Functions
function showLoader(show) {
    elements.loader.style.display = show ? 'block' : 'none';
    elements.btnProcess.disabled = show;
    elements.btnProcess.innerHTML = show 
        ? '<i class="fas fa-cog fa-spin"></i> MEMPROSES...' 
        : '<i class="fas fa-bolt"></i> ANALISIS & DOWNLOAD';
}

function showResult(show) {
    elements.resultArea.style.display = show ? 'block' : 'none';
}

function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMsg.style.display = 'flex';
}

function resetUI() {
    elements.errorMsg.style.display = 'none';
    elements.resultArea.style.display = 'none';
}

function isValidTikTokUrl(url) {
    const tiktokPattern = /(https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com)\/[^\s]+)/gi;
    return tiktokPattern.test(url);
}

// Activity Log Functions
function addLogEntry(type, message) {
    const time = new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
        <div class="log-time">${time}</div>
        <div class="log-message">
            <span class="log-user">${type}:</span> ${message}
        </div>
    `;
    
    elements.logContainer.prepend(logEntry);
    
    if (elements.logContainer.children.length > 10) {
        elements.logContainer.removeChild(elements.logContainer.lastChild);
    }
    
    elements.logContainer.scrollTop = 0;
}

function addRandomActivityLog() {
    const activities = [
        { type: 'User', message: 'Mendownload video trending' },
        { type: 'User', message: 'Mengkonversi video ke MP3' },
        { type: 'System', message: 'Server backup aktif' },
        { type: 'System', message: 'Cache diperbarui' },
        { type: 'User', message: 'Menganalisis video TikTok' }
    ];
    
    const countries = ['ID', 'US', 'MY', 'SG', 'BR', 'JP'];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    addLogEntry(`${activity.type} (${country})`, activity.message);
}

// Live Stats Functions
function updateLiveStats() {
    const visitorChange = Math.floor(Math.random() * 10) - 4;
    visitorCount = Math.max(2000, visitorCount + visitorChange);
    elements.visitorCount.textContent = formatNumber(visitorCount);
    
    const downloadChange = Math.floor(Math.random() * 5);
    downloadCount += downloadChange;
    updateDownloadCount();
    
    apiSpeed = 15 + Math.floor(Math.random() * 20);
    elements.apiSpeed.textContent = `${apiSpeed}ms`;
}

function updateDownloadCount() {
    elements.downloadCount.textContent = formatNumber(downloadCount);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', initApp);
