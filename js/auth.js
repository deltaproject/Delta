const { remote, ipcRenderer } = require("electron");
const electron = remote.app;
const Magister = remote.require("magister.js");

var app = new Vue({
    el: "#app",
    data: {
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
                console.log(result);
                return result;
            });
        },
        login() {
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
                    console.log("Error while logging in:");
                    console.log(err);
                }
            });
        }
    }
});
