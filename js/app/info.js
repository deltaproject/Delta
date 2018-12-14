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
    data.tableData.forEach(i => {
        if (i.value != null && i.value != undefined && i.value != "") {
            app.tableData.push(i);
        }
    });
});
