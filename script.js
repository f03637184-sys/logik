const i18n = {
    uk: {
        online: "Онлайн", offline: "Офлайн", title: "Вхід / Реєстрація",
        user: "Ім'я користувача", pass: "Пароль", login: "Увійти",
        reg: "Реєстрація", welcome: "Вітаємо, ", logout: "Вихід",
        notes: "Нотатки", notePlace: "Введіть свій текст тут...",
        weather: "Погода", cityPlace: "Місто...",
        weatherPlace: "Введіть місто для пошуку",
        errAuth: "Невірне ім'я або пароль", errExist: "Користувач вже існує",
        regOk: "Реєстрація успішна! Увійдіть", saved: "Збережено локально",
        wErr: "Помилка завантаження погоди", wOff: "Погода недоступна офлайн"
    },
    en: {
        online: "Online", offline: "Offline", title: "Sign In / Register",
        user: "Username", pass: "Password", login: "Login",
        reg: "Register", welcome: "Welcome, ", logout: "Logout",
        notes: "Notes", notePlace: "Type your text here...",
        weather: "Weather", cityPlace: "City...",
        weatherPlace: "Enter city to search",
        errAuth: "Invalid username or password", errExist: "User already exists",
        regOk: "Registration successful! Log in", saved: "Saved locally",
        wErr: "Error fetching weather", wOff: "Weather unavailable offline"
    }
};

let currentLang = localStorage.getItem('lang') || 'uk';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentUser = sessionStorage.getItem('currentUser') || null;

const dom = {
    status: document.getElementById('network-status'),
    themeBtn: document.getElementById('theme-toggle'),
    langSelect: document.getElementById('lang-select'),
    logoutBtn: document.getElementById('logout-btn'),
    authSec: document.getElementById('auth-section'),
    appSec: document.getElementById('app-section'),
    authTitle: document.getElementById('auth-title'),
    labelUser: document.getElementById('label-username'),
    labelPass: document.getElementById('label-password'),
    btnLogin: document.getElementById('btn-login'),
    btnReg: document.getElementById('btn-register'),
    authMsg: document.getElementById('auth-message'),
    welcome: document.getElementById('welcome-message'),
    notesTitle: document.getElementById('widget-notes-title'),
    notesArea: document.getElementById('notes-area'),
    notesStatus: document.getElementById('notes-status'),
    weatherTitle: document.getElementById('widget-weather-title'),
    weatherCity: document.getElementById('weather-city'),
    weatherBtn: document.getElementById('weather-btn'),
    weatherInfo: document.getElementById('weather-info')
};

function updateLangUI() {
    const t = i18n[currentLang];
    dom.status.textContent = window.navigator.onLine ? t.online : t.offline;
    dom.authTitle.textContent = t.title;
    dom.labelUser.textContent = t.user;
    dom.labelPass.textContent = t.pass;
    dom.btnLogin.textContent = t.login;
    dom.btnReg.textContent = t.reg;
    dom.logoutBtn.textContent = t.logout;
    dom.notesTitle.textContent = t.notes;
    dom.notesArea.placeholder = t.notePlace;
    dom.weatherTitle.textContent = t.weather;
    dom.weatherCity.placeholder = t.cityPlace;
    if (!dom.weatherInfo.querySelector('.w-data')) {
        dom.weatherInfo.textContent = t.weatherPlace;
    }
    if (currentUser) {
        dom.welcome.textContent = t.welcome + currentUser;
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    dom.themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', theme);
    currentTheme = theme;
}

function updateNetworkStatus() {
    const t = i18n[currentLang];
    if (window.navigator.onLine) {
        dom.status.textContent = t.online;
        dom.status.className = 'online';
    } else {
        dom.status.textContent = t.offline;
        dom.status.className = 'offline';
    }
}

function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || {};
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function checkAuth() {
    if (currentUser) {
        dom.authSec.classList.add('hidden');
        dom.appSec.classList.remove('hidden');
        dom.logoutBtn.classList.remove('hidden');
        dom.notesArea.value = localStorage.getItem('notes_' + currentUser) || '';
        updateLangUI();
    } else {
        dom.authSec.classList.remove('hidden');
        dom.appSec.classList.add('hidden');
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

dom.btnReg.addEventListener('click', () => {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    if (u.length < 3 || p.length < 4) return;
    
    const users = getUsers();
    if (users[u]) {
        dom.authMsg.textContent = i18n[currentLang].errExist;
        dom.authMsg.style.color = 'var(--danger-color)';
    } else {
        users[u] = p;
        saveUsers(users);
        dom.authMsg.textContent = i18n[currentLang].regOk;
        dom.authMsg.style.color = 'var(--success-color)';
    }
});

document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    
    const users = getUsers();
    if (users[u] && users[u] === p) {
        currentUser = u;
        sessionStorage.setItem('currentUser', u);
        dom.authMsg.textContent = '';
        document.getElementById('auth-form').reset();
        checkAuth();
    } else {
        dom.authMsg.textContent = i18n[currentLang].errAuth;
        dom.authMsg.style.color = 'var(--danger-color)';
    }
});

dom.logoutBtn.addEventListener('click', () => {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
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

    try {
        const res = await fetch('https://wttr.in/' + encodeURIComponent(city) + '?format=j1');
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
