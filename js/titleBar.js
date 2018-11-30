var $ = require("jquery/dist/jquery");

function minimizeWindow() {
    remote.BrowserWindow.getFocusedWindow().minimize();
}

function closeWindow(quitOnClose = true) {
    if (quitOnClose) {
        electron.quit();
    } else {
        remote.BrowserWindow.getFocusedWindow().close();
    }
}

Vue.component('title-bar', {
    template: `
    <div class="titleBar no-select">
        <div class="segmentLeft">
            <p>${$("title").html()}</p>
        </div>

        <div class="segmentRight">
            <div id="minimizeBtn" onclick="minimizeWindow()">
                <i class="fas fa-window-minimize"></i>
            </div>

            <div id="closeBtn" onclick="closeWindow()">
                <i class="fas fa-times"></i>
            </div>
        </div>
    </div>
    `
});
