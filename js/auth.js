const { remote, ipcRenderer } = require("electron");
const electron = remote.app;
const { default: magister, getSchools } = remote.require("magister.js");
const fs = require("fs");
const path = require("path");

var credsFile = path.join(electron.getPath("userData"), "delta.json");

// Event listeners
document.querySelector("body").addEventListener("keyup", function () {
    event.preventDefault();
    if (event.keyCode == 13) {
        document.getElementById("btnSubmit").click();
    }
});

if (fs.existsSync(credsFile)) {
    let rawJson = fs.readFileSync(credsFile);
    app.creds = JSON.parse(rawJson);
    app.login();
}
