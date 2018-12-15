var rm = require("electron").remote;

var app = new Vue({
    el: "#app",
    data: {
        schoolQuery: [],
        saveCreds: true,
        loginIncorrect: false,
        schoolIncorrect: false,
        isGuest: false,
        isBusy: false,
        loginSuccess: false,
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
        getSchools(callback = null) {
            getSchools(this.creds.school)
                .then((schools) => {
                    app.schoolQuery = schools;
                    if (callback != null) callback();
                });
        },
        login() {
            app.isBusy = true;
            app.loginIncorrect = false;
            app.schoolIncorrect = false;
            app.loginSuccess = false;
            
            this.getSchools(() => {
                if (this.schoolQuery.length == 0) {
                    app.schoolIncorrect = true;
                    app.isBusy = false;
                    sendNotify("De schoolnaam die je hebt ingevoerd bestaat niet. Check of je de volledige naam hebt gebruikt van de school.", "error");
                    return;
                }
    
                ipcRenderer.send("validate-creds", app.creds);
                ipcRenderer.once("login-success", (event, isSuccess) => {
                    if (isSuccess) {
                        app.loginSuccess = true;
    
                        let rawJson = JSON.stringify(app.creds);
                        if (app.saveCreds) {
                            fs.writeFile(credsFile, rawJson, 'utf8', (err) => {
                                if (err) {
                                    console.log("Unable to save credentials to file: " + err);
                                }
                            }); 
                        }
    
                        ipcRenderer.send("prepare-main");
                    } else {
                        app.loginIncorrect = true;
                        app.isBusy = false;
                        sendNotify("Je gebruikersnaam en/of wachtwoord kloppen niet.", "error");
                    }
                });
            });
        }
    }
});

if (rm.process.argv.includes("--guest")) {
    app.isGuest = true;
    app.saveCreds = false;
}
