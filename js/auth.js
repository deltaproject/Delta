const { remote, ipcRenderer } = require("electron");
const electron = remote.app;
const Magister = remote.require("magister.js");
const fs = require("fs");
const path = require('path');

var credsFile = path.join(electron.getPath("userData"), "delta.json");

var app = new Vue({
    el: "#app",
    data: {
        schoolQuery: [],
        saveCreds: true,
        loginIncorrect: false,
        schoolIncorrect: false,
        isBusy: false,
        creds: {
            school: '',
            username: '',
            password: ''
        }
    },
    computed: {
        isFormFilled: function() {
            return this.creds.school.length > 0 &&
                   this.creds.username.length > 0 &&
                   this.creds.password.length > 0;
        }
    },
    methods: {
        getSchools() {
            Magister.MagisterSchool.getSchools(this.creds.school, (err, result) => {
                if (err) console.log(err);
                app.schoolQuery = result;
            });
        },
        login() {
            app.isBusy = true;
            app.loginIncorrect = false;
            app.schoolIncorrect = false;

            Magister.MagisterSchool.getSchools(this.creds.school, (err, result) => {
                if (result.length == 0 || err) {
                    app.schoolIncorrect = true;
                    app.isBusy = false;
                    sendNotify("De schoolnaam die je hebt ingevoerd bestaat niet. Check of je de volledige naam hebt gebruikt van de school.", "error");
                    return;
                }
    
                var magister = new Magister.Magister({
                    school: this.creds.school,
                    username: this.creds.username,
                    password: this.creds.password
                });
    
                magister.ready(function () {
                    try {
                        if (magister.profileInfo().id() != undefined) {
                            let rawJson = JSON.stringify(app.creds);

                            if (app.saveCreds) {
                                fs.writeFile(credsFile, rawJson, 'utf8', (err) => {
                                    if (err) {
                                        console.log("Unable to save credentials to file: " + err);
                                    }
                                }); 
                            }
                            
                            ipcRenderer.send("login-success", app.creds);
                        }
                    } catch (err) {
                        app.loginIncorrect = true;
                        app.isBusy = false;
                        sendNotify("Je gebruikersnaam en/of wachtwoord kloppen niet.", "error");
                    }
                });
            });
        }
    }
});

// Event listeners
document.querySelector("body").addEventListener("keyup", function () {
    event.preventDefault();
    if (event.keyCode == 13) {
        document.getElementById("btnSubmit").click();
    }
});

document.getElementById("closeBtn").addEventListener("click", function () {
    electron.quit();
});

document.getElementById("minimizeBtn").addEventListener("click", function () {
    remote.BrowserWindow.getFocusedWindow().minimize();
});

if (fs.existsSync(credsFile)) {
    let rawJson = fs.readFileSync(credsFile);
    app.creds = JSON.parse(rawJson);
    // app.login();
}
