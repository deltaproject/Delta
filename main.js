const _ = require("lodash");
const Magister = require("magister.js");
const electron = require("electron");
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const url = require("url");
const isDev = require('electron-is-dev');

if (isDev) {
    require("electron-reload")(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`)
    });
}

let mainWin;
let authWin;

function createWindow() {
    mainWin = new BrowserWindow({
        width: 1220,
        height: 800,
        show: false,
        icon: path.join(__dirname, 'img/icons/icon.png')
    });

    authWin = new BrowserWindow({
        parent: mainWin,
        width: 1220,
        height: 800,
        icon: path.join(__dirname, 'img/icons/icon.png')
    });

    mainWin.on("closed", function () {
        mainWin = null;
        authWin = null;
    });

    authWin.loadURL(url.format({
        pathname: path.join(__dirname, "auth.html"),
        protocol: "file:",
        slashes: true
    }));
}

ipcMain.on("login-success", (event, creds) => {
    var m = new Magister.Magister({
        school: creds.school,
        username: creds.username,
        password: creds.password
    });

    m.ready(function () {
        global.m = m;

        mainWin.loadURL(url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true
        }));

        authWin.close();
        mainWin.show();
    })
});

app.on("ready", function () {
    createWindow();
});
