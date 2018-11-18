const { remote, ipcRenderer } = require("electron");
const electron = remote.app;
const Magister = remote.require("magister.js");

var app = new Vue({
    el: "#app",
    data: {
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
        getSchools(schoolQuery) {
            Magister.MagisterSchool.getSchools(schoolQuery, (err, result) => {
                if (err) console.log(err);
                return result;
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

document.querySelector("body").addEventListener("keyup", function () {
    event.preventDefault();
    if (event.keyCode == 13) {
        document.getElementById("btnSubmit").click();
    }
})
