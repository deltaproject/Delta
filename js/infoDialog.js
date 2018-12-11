function showInfoDialog() {
    infoWin = new remote.BrowserWindow({
        width: 400,
        height: 650,
        frame: false,
        resizable: false,
        icon: path.join(__dirname, 'img/icons/icon@64px.png')
    });

    infoWin.loadURL(url.format({
        pathname: path.join(__dirname, "info.html"),
        protocol: "file:",
        slashes: true
    }));
}
