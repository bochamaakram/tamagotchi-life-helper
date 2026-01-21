const { ipcRenderer } = require('electron');

// DOM Elements
const petEmoji = document.getElementById('pet-emoji');
const petMood = document.getElementById('pet-mood');
const levelVal = document.getElementById('level-val');

const barHealth = document.getElementById('bar-health');
const barHappiness = document.getElementById('bar-happiness');
const barHydration = document.getElementById('bar-hydration');
const barEnergy = document.getElementById('bar-energy');

const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

const btnWater = document.getElementById('btn-water');
const btnSleep = document.getElementById('btn-sleep');
const btnShop = document.getElementById('btn-shop'); // Placeholder
const btnMinimize = document.getElementById('minimize-btn');
const btnAlwaysOnTop = document.getElementById('always-on-top-btn');

// State Mappings
const MOOD_EMOJIS = {
    'happy': '😊',
    'sad': '😢',
    'sick': '🤢',
    'thirsty': '🥵',
    'sleeping': '😴',
    'default': '😐'
};

// IPC Listeners
ipcRenderer.on('update-data', (event, data) => {
    updateUI(data);
});

// Initial Update
function updateUI(data) {
    const { stats, levelInfo, tasks, petState } = data;

    // Pet
    petEmoji.textContent = MOOD_EMOJIS[petState] || MOOD_EMOJIS['default'];
    petMood.textContent = petState.charAt(0).toUpperCase() + petState.slice(1);

    // Level & Coins
    levelVal.textContent = `${levelInfo.level} | 🪙 ${levelInfo.coins || 0}`;

    // Stats
    barHealth.style.width = `${stats.health}%`;
    barHappiness.style.width = `${stats.happiness}%`;
    barHydration.style.width = `${stats.hydration}%`;
    barEnergy.style.width = `${stats.energy}%`;

    // Tasks
    renderTasks(tasks);
}

ipcRenderer.on('show-notification', (event, { title, body }) => {
    new Notification(title, { body });
});

ipcRenderer.on('shop-success', (event, itemId) => {
    alert(`Bought ${itemId}!`);
    // Logic to change bg or skin would go here
    if (itemId.startsWith('bg-')) {
        document.body.className = itemId;
    }
});

ipcRenderer.on('shop-error', (event, msg) => {
    alert(msg);
});


function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <span>${task.text}</span>
            <div class="task-actions">
                ${!task.completed ? `<button class="task-btn cmd-complete" data-id="${task.id}"><i class="fas fa-check"></i></button>` : ''}
                <button class="task-btn cmd-delete" data-id="${task.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        taskList.appendChild(li);
    });

    // Add event listeners to dynamic buttons
    document.querySelectorAll('.cmd-complete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            ipcRenderer.send('complete-task', id);
        });
    });

    document.querySelectorAll('.cmd-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            ipcRenderer.send('delete-task', id);
        });
    });
}

// User Actions
addTaskBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (text) {
        ipcRenderer.send('add-task', text);
        taskInput.value = '';
    }
});

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTaskBtn.click();
});

btnWater.addEventListener('click', () => {
    ipcRenderer.send('drink-water');
});

btnSleep.addEventListener('click', () => {
    ipcRenderer.send('sleep-pet');
});

btnMinimize.addEventListener('click', () => {
    ipcRenderer.send('minimize-app');
});

btnAlwaysOnTop.addEventListener('click', () => {
    ipcRenderer.send('toggle-always-on-top');
});

const shopModal = document.getElementById('shop-modal');
const closeShopBtn = document.getElementById('close-shop');
// Onboarding Elements
const onboardingOverlay = document.getElementById('onboarding-overlay');
const startBtn = document.getElementById('start-btn');
const toastContainer = document.getElementById('toast-container');

// Check Onboarding
if (!localStorage.getItem('onboardingShown')) {
    onboardingOverlay.classList.remove('hidden');
}

startBtn.addEventListener('click', () => {
    onboardingOverlay.classList.add('hidden');
    localStorage.setItem('onboardingShown', 'true');
    playPetAnimation('bounce');
});

// Toast System
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Animation
function playPetAnimation(anim) {
    petEmoji.parentElement.classList.remove('bounce');
    void petEmoji.parentElement.offsetWidth; // trigger reflow
    petEmoji.parentElement.classList.add(anim);
}

// Interactions with Feedback
btnShop.addEventListener('click', () => {
    shopModal.classList.remove('hidden');
});

closeShopBtn.addEventListener('click', () => {
    shopModal.classList.add('hidden');
});

document.querySelectorAll('.shop-item').forEach(item => {
    item.addEventListener('click', () => {
        const id = item.dataset.id;
        // Highlight logic could go here
        ipcRenderer.send('buy-item', id);
    });
});

// Hooking into existing events for feedback
// We need to modify existing listeners or add new generic ones if possible. 
// For now, let's wrap the IPC calls or listen to replies.

ipcRenderer.on('shop-success', (event, itemId) => {
    showToast(`Purchased ${itemId}!`);
    const name = itemId.split('-')[1];
    if (itemId.startsWith('bg-')) {
        document.body.className = `bg-${name}`;
    }
});

ipcRenderer.on('shop-error', (event, msg) => {
    showToast(`❌ ${msg}`);
});

// Override buttons to add animations
btnWater.addEventListener('click', () => {
    ipcRenderer.send('drink-water');
    showToast('Glug glug! 💧');
    playPetAnimation('bounce');
});

btnSleep.addEventListener('click', () => {
    ipcRenderer.send('sleep-pet');
    showToast('Zzz... 😴');
});

addTaskBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (text) {
        ipcRenderer.send('add-task', text);
        taskInput.value = '';
        showToast('Task added! 📝');
    }
});

// Listen for task completion (requires delegated event or update)
// Since we clear task list on update, we rely on rendering logic.
// We can assume if stats go up, we might want to animate, but let's keep it simple.


