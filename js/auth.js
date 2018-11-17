const { remote, ipcRenderer } = require("electron");
const electron = remote.app;
const Magister = remote.require("magister.js");

var app = new Vue({
    el: "#app",
    data: {
        loginIncorrect: false,
        schoolIncorrect: false,
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
            app.loginIncorrect = false;
            app.schoolIncorrect = false;

            Magister.MagisterSchool.getSchools(this.creds.school, (err, result) => {
                if (err) {
                    console.log(err);
                    app.schoolIncorrect = true;
                    return;
                }

                if (result.length == 0) {
                    app.schoolIncorrect = true;
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
                    }
                });
            });
        }
    }
});
