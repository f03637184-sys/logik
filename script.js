const i18n = {
    uk: {
        authTitle: "Вхід",
        labelUsername: "Ім'я користувача",
        labelPassword: "Пароль",
        btnLogin: "Увійти",
        logoutBtn: "Вихід",
        welcomeMessage: "Вітаємо, {name}!",
        widgetNotesTitle: "Нотатки",
        notesPlaceholder: "Введіть свій текст тут...",
        saved: "Автоматично збережено",
        widgetWeatherTitle: "Погода",
        weatherCityPlaceholder: "Місто...",
        wLoading: "Завантаження...",
        wErr: "Місто не знайдено",
        wOff: "Немає мережі для запиту погоди",
        errAuth: "Неправильне ім'я або пароль"
    },
    en: {
        authTitle: "Login",
        labelUsername: "Username",
        labelPassword: "Password",
        btnLogin: "Login",
        logoutBtn: "Logout",
        welcomeMessage: "Welcome, {name}!",
        widgetNotesTitle: "Notes",
        notesPlaceholder: "Type your text here...",
        saved: "Automatically saved",
        widgetWeatherTitle: "Weather",
        weatherCityPlaceholder: "City...",
        wLoading: "Loading...",
        wErr: "City not found",
        wOff: "No network connection",
        errAuth: "Invalid username or password"
    }
};

let currentLang = localStorage.getItem('lang') || 'uk';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentUser = sessionStorage.getItem('currentUser') || null;

const dom = {
    themeBtn: document.getElementById('theme-toggle'),
    langSelect: document.getElementById('lang-select'),
    networkStatus: document.getElementById('network-status'),
    logoutBtn: document.getElementById('logout-btn'),
    authSection: document.getElementById('auth-section'),
    appSection: document.getElementById('app-section'),
    authForm: document.getElementById('auth-form'),
    authMsg: document.getElementById('auth-message'),
    welcomeMessage: document.getElementById('welcome-message'),
    notesArea: document.getElementById('notes-area'),
    notesStatus: document.getElementById('notes-status'),
    weatherCity: document.getElementById('weather-city'),
    weatherBtn: document.getElementById('weather-btn'),
    weatherInfo: document.getElementById('weather-info')
};

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    dom.themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function updateLangUI() {
    const t = i18n[currentLang];
    
    document.getElementById('auth-title').textContent = t.authTitle;
    document.getElementById('label-username').textContent = t.labelUsername;
    document.getElementById('label-password').textContent = t.labelPassword;
    document.getElementById('btn-login').textContent = t.btnLogin;
    dom.logoutBtn.textContent = t.logoutBtn;
    
    document.getElementById('widget-notes-title').textContent = t.widgetNotesTitle;
    dom.notesArea.placeholder = t.notesPlaceholder;
    
    document.getElementById('widget-weather-title').textContent = t.widgetWeatherTitle;
    dom.weatherCity.placeholder = t.weatherCityPlaceholder;
    
    if (currentUser) {
        dom.welcomeMessage.textContent = t.welcomeMessage.replace("{name}", currentUser);
    }
}

function updateNetworkStatus() {
    if (navigator.onLine) {
        dom.networkStatus.textContent = "Online";
        dom.networkStatus.className = "online";
    } else {
        dom.networkStatus.textContent = "Offline";
        dom.networkStatus.className = "offline";
    }
}

function checkAuth() {
    if (currentUser) {
        dom.authSection.classList.add('hidden');
        dom.appSection.classList.remove('hidden');
        dom.logoutBtn.classList.remove('hidden');
        
        const savedNotes = localStorage.getItem('notes_' + currentUser);
        dom.notesArea.value = savedNotes ? savedNotes : '';
        
        updateLangUI();
    } else {
        dom.authSection.classList.remove('hidden');
        dom.appSection.classList.add('hidden');
        dom.logoutBtn.classList.add('hidden');
    }
}

dom.themeBtn.addEventListener('click', () => {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
});

dom.langSelect.value = currentLang;
dom.langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    localStorage.setItem('lang', currentLang);
    updateLangUI();
});

dom.authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    
    if (u === "admin" && p === "admin") {
        currentUser = u;
        sessionStorage.setItem('currentUser', u);
        dom.authMsg.textContent = '';
        dom.authForm.reset();
        checkAuth();
    } else {
        dom.authMsg.textContent = i18n[currentLang].errAuth;
        dom.authMsg.style.color = 'var(--danger-color)';
    }
});

dom.logoutBtn.addEventListener('click', () => {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    dom.weatherInfo.innerHTML = '';
    checkAuth();
});

dom.notesArea.addEventListener('input', (e) => {
    if (currentUser) {
        localStorage.setItem('notes_' + currentUser, e.target.value);
        dom.notesStatus.textContent = i18n[currentLang].saved;
        setTimeout(() => { dom.notesStatus.textContent = ''; }, 1500);
    }
});

dom.weatherBtn.addEventListener('click', async () => {
    const city = dom.weatherCity.value.trim();
    if (!city) return;

    if (!window.navigator.onLine) {
        dom.weatherInfo.textContent = i18n[currentLang].wOff;
        return;
    }

    dom.weatherInfo.textContent = i18n[currentLang].wLoading;

    try {
        const res = await fetch('https://wttr.in' + encodeURIComponent(city) + '?format=j1');
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        const currentCondition = data.current_condition[0];
        const temp = currentCondition.temp_C;
        const desc = currentCondition.weatherDesc[0].value;
        
        dom.weatherInfo.innerHTML = '<div class="w-data"><strong>' + city + '</strong>:<br>' + temp + '°C, ' + desc + '</div>';
    } catch (err) {
        dom.weatherInfo.textContent = i18n[currentLang].wErr;
    }
});

dom.weatherCity.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') dom.weatherBtn.click();
});

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

setTheme(currentTheme);
updateLangUI();
updateNetworkStatus();
checkAuth();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swCode = `
            const CACHE_NAME = 'multiapp-v1';
            const ASSETS = [
                './',
                './index.html',
                './style.css',
                './script.js'
            ];
            self.addEventListener('install', e => {
                e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
            });
            self.addEventListener('fetch', e => {
                e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
            });
        `;
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        navigator.serviceWorker.register(workerUrl).catch(() => {});
    });
}

