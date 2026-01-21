const { app, BrowserWindow, ipcMain, Tray, Menu, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');
const Pet = require('./src/modules/petLogic');
const TaskManager = require('./src/modules/taskManager');

const store = new Store();
const pet = new Pet(store);
const taskManager = new TaskManager(store);

let mainWindow;
let tray;

function createWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: 320,
        height: 480,
        x: screenWidth - 340, // Position top-right by default
        y: 20,
        frame: false,
        transparent: true,
        resizable: false,
        alwaysOnTop: store.get('alwaysOnTop', false),
        skipTaskbar: true, // Don't show in taskbar if we have a tray
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    mainWindow.loadFile('src/index.html');

    // mainWindow.webContents.openDevTools({ mode: 'detach' });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Start pet decay loop when window is ready
    pet.startDecay();

    // Send initial state to renderer when it finishes loading
    mainWindow.webContents.on('did-finish-load', () => {
        sendUpdate();
    });
}

function sendUpdate() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('update-data', {
            stats: pet.stats,
            levelInfo: pet.levelInfo,
            tasks: taskManager.getTasks(),
            petState: pet.getstatus()
        });
    }
}

// Hook into pet save/updates to refresh UI if needed (simplified by polling in UI or event driven)
// For now, we'll send updates on specific actions.

app.whenReady().then(() => {
    createWindow();

    tray = new Tray(path.join(__dirname, 'assets/icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show/Hide', click: () => {
                if (mainWindow.isVisible()) mainWindow.hide();
                else mainWindow.show();
            }
        },
        { label: 'Quit', click: () => app.quit() }
    ]);
    tray.setToolTip('Productivity Tamagotchi');
    tray.setContextMenu(contextMenu);

    // Decay interval in main process triggers UI updates
    setInterval(() => {
        sendUpdate();
    }, 1000 * 60); // Verify sync every minute or so, though petLogic updates internally. 
    // Actually, petLogic doesn't emit events. We might want to poll or make Pet emit events.
    // For simplicity, we just send updates on IPC events and maybe a faster heartbeat.
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers
ipcMain.on('minimize-app', () => {
    mainWindow.hide();
});

ipcMain.on('toggle-always-on-top', () => {
    const current = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!current);
    store.set('alwaysOnTop', !current);
});

// Task Events
ipcMain.on('add-task', (event, text) => {
    taskManager.addTask(text);
    sendUpdate();
});

ipcMain.on('complete-task', (event, id) => {
    const success = taskManager.completeTask(id);
    if (success) {
        pet.feed(); // Completing task triggers feed
        pet.addXp(10);
    }
    sendUpdate();
});

ipcMain.on('delete-task', (event, id) => {
    taskManager.deleteTask(id);
    sendUpdate();
});

// Pet Interaction Events
ipcMain.on('drink-water', () => {
    pet.drink();
    sendUpdate();
});

ipcMain.on('sleep-pet', () => {
    pet.sleep();
    sendUpdate();
});

ipcMain.on('buy-item', (event, itemId) => {
    // Simplified Shop Logic
    const prices = { 'bg-forest': 50, 'bg-space': 100, 'skin-cat': 200 };
    const price = prices[itemId];

    if (price && pet.spendCoins(price)) {
        // In a real app, store inventory. For now, we just acknowledge the transaction.
        event.sender.send('shop-success', itemId);
        sendUpdate();
    } else {
        event.sender.send('shop-error', 'Not enough coins!');
    }
});

ipcMain.on('toggle-work', () => {
    const isWorking = pet.toggleWork();
    sendUpdate();
});

function checkStatusForNotifications() {
    const status = pet.getstatus();
    if (status === 'thirsty' || status === 'sad' || status === 'sick') {
        const NOTIFICATION_TITLE = 'Your Pet Needs You!';
        const NOTIFICATION_BODY = `Your pet is feeling ${status}. check in!`;

        // Use Notification if available (Main process)
        // Note: Electron requires appId for notifications on Windows sometimes.
        // Or send to renderer to show.
        if (mainWindow) {
            mainWindow.webContents.send('show-notification', { title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY });
        }
    }
}

// Modify Decay Loop
setInterval(() => {
    checkStatusForNotifications();
    sendUpdate();
}, 1000 * 60 * 60); // Check notifications every hour to avoid spam

