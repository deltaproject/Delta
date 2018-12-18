var app = new Vue({
    el: "#app",
    data: {
        isBeta: false,
        isRefreshCooldown: false,
        isUpdateRunning: false,
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
                    if (element.isRead == readState)
                        array.push(element);
                }

                return array;
            },
            filterHomework(doneState) {
                let array = [];

                for (let i = 0; i < this.appointments.length; i++) {
                    const element = this.appointments[i];
                    if (element.isDone == doneState &&
                        element.content != undefined &&
                        element.infoType == 1)

                        array.push(element);
                }

                return array;
            },
            parseGrade(grade) {
                if (!isNaN(parseFloat(grade.grade.replace(",", "."))) &&
                    grade.weight > 0 && grade.counts) {

                    return parseFloat(grade.grade.replace(",", "."));
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
                    if (element.type.header == null &&
                        element.weight > 0) {

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
                var downloadsPath = electron.getPath("downloads");
                var filePath = path.join(downloadsPath, file.name);
                var fileStream = fs.createWriteStream(filePath);

                fileStream.on("open", () => {
                    file.download()
                    .then((stream) => {
                        console.log(stream);

                        stream.on("data", (data) => {
                            fileStream.write(data);
                        });

                        // shell.openItem(filePath)
                    });
                });
            }
        },
        formatTime(date) {
            return moment(date).format("H:mm");
        },
        formatDateHuman(date) {
            if (date != undefined && date != null) {
                return moment(date).format("LL");
            } else {
                return null;
            }
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
            let element = document.createElement("p");
            let finalString;
            element.innerHTML = str;
            finalString = element.textContent || element.innerText || "";
            
            finalString = finalString
                .split("\n").join(" ")
                .split("\r").join(" ");

            if (finalString.length > maxLength) {
                finalString = finalString.substring(0, maxLength - 3) + "...";
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
            return "Naam:\t" + file.name + "\n" +
                   "Grootte:\t" + Math.round(file.size / 1024) + " KB" + "\n\n" +
                   "Klik om te downloaden.";
        }
    },
    methods: {
        toggleHomeworkState(appointment) {
            appointment.isDone = !appointment.isDone;
            appointment.saveChanges();
            refreshHomework();

            if (appointment.isDone) {
                sendNotify("Huiswerk is afgerond!", "success");
            } else {
                sendNotify("Huiswerk gemarkeerd als onafgerond.", "success");
            }
        },
        showAppointmentInfo(appointment) {
            var tableData = [
                { "name": "Datum", "value": this.formatDateHuman(appointment.start) },
                { "name": "Locatie", "value": appointment.location },
                { "name": "Docent" +  (appointment.teachers.length == 1 ? "" : "en"),
                    "value": `${appointment.teachers[0].fullName} (${appointment.teachers[0].teacherCode})` }
            ];

            if (appointment.content != null) {
                tableData.push({ "name": "Afgerond", "value": appointment.isDone ? "Ja" : "Nee" });
            }

            showInfoDialog(appointment.classes[0], tableData, appointment.content);
        },
        showGradeInfo(grade) {
            showInfoDialog(grade.class.description, [
                    { "name": "Beschrijving", "value": grade.description },
                    { "name": "Datum van afname", "value": this.formatDateHuman(grade.testDate) },
                    { "name": "Invoerdatum", "value": this.formatDateHuman(grade.dateFilledIn) },
                    { "name": "Weging", "value": grade.weight.toString() }
                ], null, "gradeInfo", grade.grade);
        },
        showAssignmentInfo(assignment) {
            console.log(assignment.class);
            
            showInfoDialog(assignment.name, [
                    { "name": "Vak", "value": assignment.class },
                    { "name": "Deadline", "value": this.formatDateHuman(assignment.deadline) },
                    { "name": "Ingeleverd op", "value": this.formatDateHuman(assignment.handedInOn) },
                    { "name": "Voltooid", "value": assignment.finished ? "Ja" : "Nee" }
                ], assignment.description, "assignmentInfo", "fas fa-edit");
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
            app.isUpdateRunning = true;

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
                app.isUpdateRunning = false;

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
                var installerProcess = spawn(updateData.targetPath, ["/silent"], {
                    detached: true
                });

                installerProcess.unref();
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
