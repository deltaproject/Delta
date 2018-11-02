const { remote } = require("electron");
const electron = remote.app;
var m = remote.getGlobal("m");
var magister = remote.getGlobal("magister");

var app = new Vue({
    el: "#app",
    data: {
        school: '',
        username: '',
        password: ''
    },
    computed: {
        isFormFilled: function() {
            return this.school.length > 0 &&
                   this.username.length > 0 &&
                   this.password.length > 0;
        }
    },
    methods: {
        getSchools() {
            magister.MagisterSchool.getSchools(this.school, (err, result) => {
                if (err) console.log(err);
                console.log(result);
                return result;
            });
        }
    }
});
