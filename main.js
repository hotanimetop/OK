const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// ── URL trang web muốn đóng gói thành app ──
const APP_URL = 'https://vltk8.blogspot.com/';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    title: 'VLTK8',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    autoHideMenuBar: true, // ẩn menu bar mặc định (File/Edit/View...)
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  // Bỏ hẳn menu bar (bấm Alt cũng không hiện)
  Menu.setApplicationMenu(null);

  mainWindow.loadURL(APP_URL);

  // Link nào không thuộc blogspot.com thì mở bằng trình duyệt ngoài,
  // tránh app tự mở tab lạ bên trong webview
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.includes('blogspot.com')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Nếu load lỗi (mất mạng, DNS...) thì tự thử load lại sau 3s
  mainWindow.webContents.on('did-fail-load', (_e, errorCode) => {
    if (errorCode === -3) return; // -3 = ABORTED, thường do điều hướng bình thường, bỏ qua
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.loadURL(APP_URL);
    }, 3000);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
