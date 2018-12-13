var app = new Vue({
    el: "#app",
    data: {
        schoolQuery: [],
        saveCreds: true,
        loginIncorrect: false,
        schoolIncorrect: false,
        isBusy: false,
        loginSuccess: false,
        creds: {
            school: '',
            username: '',
            password: ''
        }
    }
});
