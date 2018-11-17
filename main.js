const _ = require("lodash");
const Magister = require("magister.js");
const electron = require("electron");
const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const isDev = require('electron-is-dev');

if (isDev) {
    require("electron-reload")(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`)
    });
}

function createWindow() {
    // Menu.setApplicationMenu(null);

    mainWin = new BrowserWindow({ width: 1220, height: 800,
        icon: path.join(__dirname, 'img/icons/icon.png')
    });

    // authWin = new BrowserWindow({ width: 1220, height: 800,
    //     icon: path.join(__dirname, 'img/icons/icon.png')
    // });

    mainWin.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));

    // authWin.loadURL(url.format({
    //     pathname: path.join(__dirname, "auth.html"),
    //     protocol: "file:",
    //     slashes: true
    // }));

    mainWin.on("closed", function () {
        mainWin = null;
        // authWin = null;
    });
}

var m = new Magister.Magister({
    school: '',
    username: '',
    password: ''
});

app.on("ready", function () {
    m.ready(function () {
        console.log("Magister is ready.");
        global.m = m;
        global.magister = Magister;

        createWindow();
    });
});
