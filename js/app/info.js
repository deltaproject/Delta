var ipc = require("electron").ipcRenderer;

var app = new Vue({
    el: "#app",
    data: {
        header: "",
        content: null,
        tableData: []
    },
    methods: {
        closeInfo() {
            close();
        }
    }
});

ipc.on("info-data", function (event, data) {
    app.header = data.header;
    app.content = data.content;
    app.tableData = data.tableData;
});
