const { remote, ipcRenderer } = require("electron");
const path = require("path");
const url = require("url");
const os = require("os");
const moment = require("moment");
const _ = require("lodash");
const fs = require("fs");
const electron = remote.app;
const shell = remote.shell;
const dialog = remote.dialog;
const download = require("download");
const $ = require("jquery/dist/jquery");
moment.locale("nl");

var m = remote.getGlobal("m");
var today = new Date();
var agendaDate = new Date();
var inTwoWeeks = new Date();

if ([5, 6].includes(today.getDay())) {
    agendaDate.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
} else {
    agendaDate.setDate(today.getDate() + 1);
}

var dayFormat = moment(agendaDate).format("dddd");
var contentLoaded = 0;
inTwoWeeks = moment(inTwoWeeks).add(14, 'days').toDate();

var app = new Vue({
    el: "#app",
    data: {
        isBeta: false,
        isRefreshCooldown: false,
        agendaDate: "",
        showDoneHomework: false,
        showReadMail: false,
        profile: {
            username: "Onbekende gebruiker",
            imgUrl: "./img/icons/user.png"
        },
        magister: {
            appointments: [],
            messages: [],
            grades: [],
            assignments: [],
            tests: [],
            insights: [],
            filterMessages(readState, maxMessages = 8) {
                let array = [];
                for (let i = 0; i < this.messages.length; i++) {
                    if (i == maxMessages) {
                        break;
                    }

                    const element = this.messages[i];
                    if (element.isRead() == readState)
                        array.push(element);
                }

                return array;
            },
            filterHomework(doneState) {
                let array = [];
                for (let i = 0; i < this.appointments.length; i++) {
                    const element = this.appointments[i];
                    if (element.isDone() == doneState
                        && element.content().length > 0
                        && !["test", "quiz"].includes(element.infoTypeString()))

                        array.push(element);
                }

                return array;
            },
            parseGrade(grade) {
                if (!isNaN(parseFloat(grade.grade().replace(",", "."))) && grade.weight() > 0 && grade.counts()) {
                    return parseFloat(grade.grade().replace(",", "."));
                }
            },
            gradeToString(gradeFloat) {
                return gradeFloat.toString().replace(".", ",");
            },
            getLastGrades(maxItems = 5) {
                let lastGrades = [];
                for (let i = 0; i < this.grades.length; i++) {
                    if (lastGrades.length == maxItems)
                        break;

                    const element = this.grades[i];
                    if (element.type().header() == null && element.weight() > 0) {
                        lastGrades.push(element);
                    }
                }

                return lastGrades;
            },
            isFailed(grade) {
                let gradeFloat;
                gradeFloat = parseFloat(grade.replace(",", "."));
                return gradeFloat < 5.5;
            },
            isWellDone(grade) {
                let gradeFloat;
                gradeFloat = parseFloat(grade.replace(",", "."));
                return gradeFloat > 8.0;
            },
            downloadAttachment(file) {
                var downloadsPath = electron.getPath('downloads');
                var filePath = path.join(downloadsPath, file.name())

                file.download(downloadsPath, (err, result) => {
                    if (err) console.log(err);
                    shell.openItem(filePath)
                    console.log(filePath)
                });
            }
        },
        formatTime(date) {
            return moment(date).format("H:mm");
        },
        formatDateHuman(date) {
            return moment(date).format("LL");
        },
        getDateDifference(date1, date2, returnRawDays) {
            var firstConvert = moment(date1);
            var secondConvert = moment(date2);
            var diff = moment(secondConvert.diff(firstConvert, 'days'));

            if (!returnRawDays)
                return diff;
            else
                return diff._i + 1;
        },
        trimContent(str, maxLength = 120) {
            let finalString = "";

            finalString = str
                .split("\n").join(" ")
                .split("\r").join(" ");

            if (str.length > maxLength) {
                finalString = str.substring(0, maxLength - 3) + "...";
            } else {
                finalString = str;
            }

            return finalString;
        },
        getFileIcon(fileName) {
            var extIndex = fileName.lastIndexOf(".");
            var ext = fileName.substring(extIndex + 1);

            if (ext == "doc" || ext == "docx") {
                return "fa-file-word";

            } else if (ext == "ppt" || ext == "pptx" || ext == "ppsx") {
                return "fa-file-powerpoint";

            } else if (ext == "xls" || ext == "xlsx") {
                return "fa-file-excel";

            } else if (ext == "pdf") {
                return "fa-file-pdf";

            } else {
                return "fa-file";
            }
        },
        getAttachmentTitle(file) {
            return "Naam:\t" + file.name() + "\n" +
                   "Grootte:\t" + Math.round(file.size() / 1024) + " KB" + "\n\n" +
                   "Klik om te downloaden.";
        }
    },
    methods: {
        toggleHomeworkState(appointment) {
            appointment.isDone(!appointment.isDone());
            refreshHomework();

            if (appointment.isDone()) {
                sendNotify("Huiswerk is afgerond!", "success");
            } else {
                sendNotify("Huiswerk gemarkeerd als onafgerond.", "success");
            }
        },
        showInfoDetails(appointment) {
            dialogInfo("Deze functie is helaas nog niet beschikbaar.")
        },
        signOff() {
            var credsFile = path.join(electron.getPath("userData"), "delta.json");
            try {
                fs.unlinkSync(credsFile);
                electron.relaunch();
                electron.quit();
            } catch (error) {
                dialogError("Er ging iets fout tijdens het afmelden. " +
                    "Probeer Delta opnieuw op te starten en vervolgens opnieuw af te melden.");
            }
        },
        downloadUpdates(releaseData) {
            let targetPlatform;
            let targetUrl;
            let targetFilename;

            switch (os.type()) {
                case "Windows_NT":
                    targetPlatform = "windows";
                    break;
                case "Linux":
                    targetPlatform = "linux";
                    break;
                case "Darwin":
                    targetPlatform = "macOS";
                    break;
            }

            for (let i = 0; i < releaseData.assets.length; i++) {
                const element = releaseData.assets[i];
                if (element.name.indexOf(targetPlatform) != -1) {
                    targetUrl = element.browser_download_url;
                    targetFilename = element.name;
                }
            }

            var downloadsPath = electron.getPath('downloads');
            var filePath = path.join(downloadsPath, targetFilename);

            download(targetUrl, downloadsPath).then(() => {
                var updateData = {
                    targetPlatform: targetPlatform,
                    targetUrl: targetUrl,
                    targetFilename: targetFilename,
                    targetPath: filePath
                };
    
                dialogQuestion(
                    `Er is een update beschikbaar, versie ${releaseData.tag_name}. ` +
                    "Hij is al gedownload op je computer.\nWil je hem nu installeren?",
                    "Update",
                    ["Installeer nu", "Later"], 1,
                    function(response) {
                        var install = response == 0 ? true : false;
                        if (install) {
                            app.installUpdates(updateData);
                        }
                    }
                );
            });
        },
        installUpdates(updateData) {
            if (updateData.targetPlatform == "windows") {
                shell.openItem(updateData.targetPath);
            } else {
                shell.showItemInFolder(updateData.targetPath);
            }

            electron.quit();
        },
        checkUpdates() {
            var url = "https://api.github.com/repos/deltaproject/Delta/releases";
            $.getJSON(url, function(data) {
                $.getJSON(`https://raw.githubusercontent.com/deltaproject/Delta/${data[0].tag_name}/package.json`, function(packageData) {
                    var currentVersion = electron.getVersion();
                    var latestVersion = packageData.version;
                    if (currentVersion != latestVersion) {
                        app.downloadUpdates(data[0]);
                    }
                });
            });
        },
        setRefreshCooldown() {
            this.isRefreshCooldown = true;

            setTimeout(() => {
                this.isRefreshCooldown = false;
            }, 2500);
        }
    }
});

function computeInsights() {
    let insights = [];

    Array.prototype.min = function() {
        return Math.min.apply(null, this);
    };

    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    };

    let failedGrades = [];
    let allGrades = app.magister.grades.slice(0);
    allGrades.reverse();

    let validGrades = [];
    let validGradesRaw = [];

    for (let i = 0; i < allGrades.length; i++) {
        const element = allGrades[i];
        var parsedGrade = app.magister.parseGrade(element);
        if (parsedGrade != undefined) {
            if (parsedGrade < 5.5) {
                failedGrades.push(parsedGrade);
            }

            validGrades.push(parsedGrade);
            validGradesRaw.push(element);
        }
    }

    insights.push({
        name: "Je hoogste cijfer was een " +
            app.magister.gradeToString(validGrades.max())  + ".",

        icon: "fas fa-star",
        colors: {
            bg: "rgb(65, 244, 223)",
            fg: "rgb(65, 133, 244)"
        }
    });

    insights.push({
        name: "Je laagste cijfer was een " +
            app.magister.gradeToString(validGrades.min()) + ".",

        icon: "fas fa-angle-double-down",
        colors: {
            bg: "red",
            fg: "white"
        }
    });

    insights.push({
        name: "Je hebt dit jaar " +
            failedGrades.length + ` onvoldoende${failedGrades.length > 1 ? "s" : ""} gehaald.`,

        icon: null,
        colors: {}
    });

    return insights;
}

function isContentLoaded(callback) {
    if (contentLoaded == 5) {
        callback();
    } else {
        window.setTimeout(() => {
            isContentLoaded(callback);
        }, 100)
    }
}

function refreshHomework(initial = false) {
    m.appointments(agendaDate, inTwoWeeks, function (e, appointments) {
        let tests = [];
        for (let i = 0; i < appointments.length; i++) {
            const element = appointments[i];
            
            if (element.infoTypeString() == "test" ||
                element.infoTypeString() == "quiz") {

                tests.push(element);
            }
        }

        app.magister.tests = tests;

        if (initial)
            contentLoaded++;
    });
}

function refreshData(initial = false) {
    if (app.isRefreshCooldown) {
        return;
    }

    m.appointments(agendaDate, agendaDate, function (e, appointments) {
        app.magister.appointments = appointments;
        if (initial)
            contentLoaded++;
    });

    refreshHomework(true);

    m.currentCourse(function (courseErr, course) {
        course.grades(function(e, grades) {
            grades.sort(function (a, b) {
                var dateA = new Date(a.dateFilledIn());
                var dateB = new Date(b.dateFilledIn());
                return dateB - dateA;
            });
            
            var validGrades = [];
            grades.forEach(i => {
                if (i.counts() && i.weight() > 0)
                    validGrades.push(i);
            });
    
            app.magister.grades = grades;
            app.magister.insights = computeInsights();
            refreshGraph(validGrades);
            if (initial)
                contentLoaded++;
        });
    });
    
    m.inbox().messages(function (e, messages) {
        app.magister.messages = messages;
        if (initial)
            contentLoaded++;
    });
    
    m.assignments(function (e, assignments) {
        app.magister.assignments = assignments;
        if (initial)
            contentLoaded++;
    });

    if (initial) {
        isContentLoaded(() => {
            ipcRenderer.send("content-loaded");
            app.checkUpdates();
        })
    }
}

app.profile.username = m.profileInfo().fullName();
app.agendaDate = dayFormat;

if (m != null) {
    console.log("Successfully authenticated with Magister!");
} else {
    console.log("Unable to authenticate with Magister.");
}

refreshData(true);
