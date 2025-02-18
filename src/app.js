const path = require('path'),
    Datastore = require('nedb-promises'),
    { Window } = require('./utils/window'),
    consvol = 0.10,
    electron = require('electron'),
    { app, Menu, Tray, globalShortcut, session } = electron,
    trayicon = path.join(__dirname, 'assets', 'dist_icon.png');
process.env.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.5143.21';

let cfgId, url, win, tray, db = Datastore.create({ filename: `${app.getPath('userData')}/deezer_data.db`, autoload: true });

let singleton = null

async function createWin() {
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['User-Agent'] = process.env.userAgent;
        callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    (async () => {
        try {
            let data = await loadDatabase();
            if (data) {
                url = data.loadURL;
                cfgId = data._id;
                if (url.indexOf("deezer.com") < 0) url = undefined;
            }
            tray = new Tray(trayicon);
            win = new Window(app, url, electron.screen.getPrimaryDisplay().workAreaSize);
            singleton = win;
            register_mediaKeys();
            update_tray();
        } catch (err) {
            console.warn("Database error:", err.message);
        }
    })(); // Closes async database call
}


function register_mediaKeys() {
    if (!globalShortcut.isRegistered("medianexttrack"))
        globalShortcut.register('medianexttrack', () => {
            win.webContents.executeJavaScript("window.dzPlayerControl.next();");
        });
    if (!globalShortcut.isRegistered("mediaplaypause"))
        globalShortcut.register('mediaplaypause', () => {
            win.webContents.executeJavaScript("window.dzPlayerControl.playPause();");
        });
    if (!globalShortcut.isRegistered("mediaprevioustrack"))
        globalShortcut.register('mediaprevioustrack', () => {
            win.webContents.executeJavaScript("dzPlayer.control.prevSong()");
        });
}

function update_tray() {
    let model = [{
        label: "Controls",
        enabled: false
    }, {
        label: "Play/Pause",
        enabled: true,
        click: () => {
            win.webContents.executeJavaScript("window.dzPlayerControl.playPause();");
        }
    }, {
        label: "Next",
        enabled: true,
        click: () => {
            win.webContents.executeJavaScript("window.dzPlayerControl.next();");
        }
    }, {
        label: "Previous",
        enabled: true,
        click: () => {
            win.webContents.executeJavaScript("dzPlayer.control.prevSong()");
        }
    }, {
        label: "Unfavourite/Favourite",
        enabled: true,
        click: () => {
            win.webContents.executeJavaScript("document.querySelectorAll('.player-bottom .track-actions button')[2].click();");
        }
    }, {
        label: "Volume",
        enabled: false
    }, {
        label: "Volume UP",
        enabled: true,
        click: () => {
            win.webContents.executeJavaScript(`vol = dzPlayer.volume; vol += ${consvol}; vol > 1 && (vol = 1); dzPlayer.control.setVolume(vol);`)
        }
    }, {
        label: "Volume Down",
        enabled: true,
        click: () => {
            win.webContents.executeJavaScript(`vol = dzPlayer.volume; vol -= ${consvol}; vol < 0 && (vol = 0); dzPlayer.control.setVolume(vol);`)
        }
    }, {
        label: "Volume Mute",
        enabled: true,
        click: () => {
            win.webContents.executeJavaScript("dzPlayer.control.mute(!dzPlayer.muted)")
        }
    }, {
        label: "APP",
        enabled: false
    }, {
        label: "Show Window",
        enabled: true,
        click: () => {
            if (!win.isVisible())
                win.restore();
        }
    }, {
        label: "Quit",
        enabled: true,
        click: () => {
            saveData();
            win.destroy()
            app.quit()
        }
    }];
    tray.on("click", () => {
        if (!win.isVisible())
            win.restore();
    })
    tray.setContextMenu(new Menu.buildFromTemplate(model))
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    // CPU/GPU enhancements
    app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');
    app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
    app.commandLine.appendSwitch('disable-software-rasterizer');
    app.commandLine.appendSwitch('enable-gpu-rasterization');
    app.commandLine.appendSwitch('enable-zero-copy');   
    app.commandLine.appendSwitch('enable-frame-rate-limit');

    // ~web~ enhancements
    app.commandLine.appendSwitch('enable-features', 'WebRTC-H264WithOpenH264FFmpeg');
    app.commandLine.appendSwitch('enable-zero-copy');
    app.commandLine.appendSwitch('ignore-gpu-blacklist');
    app.commandLine.appendSwitch('disable-gpu-vsync');
    app.commandLine.appendSwitch('enable-gpu-rasterization');
    app.commandLine.appendSwitch('force-color-profile', 'srgb');
    app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');

    // Experiments
    app.commandLine.appendSwitch('disable-background-timer-throttling');
    app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
    app.commandLine.appendSwitch('enable-low-end-device-mode');

    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (singleton) {
            if (singleton.isMinimized() || !singleton.isVisible()) singleton.restore()
            singleton.focus()
        }
    })
    app.on('ready', createWin)
}

app.on('browser-window-created', (e, window) => {
    window.setMenuBarVisibility(false);
})

let saveTimeout;
async function saveData() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        if (cfgId) {
            await db.update({ _id: cfgId }, { $set: { loadURL: win.webContents.getURL() } });
        } else {
            await db.insert({ loadURL: win.webContents.getURL() });
        }
    }, 1000);
}

let cachedData = null;  // Cache variable

async function loadDatabase() {
    if (!cachedData) { // If not already cached
        cachedData = await db.findOne({});
    }
    return cachedData;
}
