const { remote, ipcRenderer } = require("electron");
const { spawn } = require('child_process');
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
const Vue = require("vue/dist/vue");
var $ = require("jquery/dist/jquery");
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
inTwoWeeks = moment(inTwoWeeks).add(14, 'days').toDate();

function resetLoadState() {
    for (var key in app.isLoaded) {
        if (app.isLoaded.hasOwnProperty(key)) {
            app.isLoaded[key] = false;
        }
    }

    app.magister.appointments = [];
    app.magister.messages = [];
    app.magister.grades = [];
    app.magister.assignments = [];
    app.magister.tests = [];
    app.magister.insights = [];
}

function refreshHomework() {
    m.appointments(agendaDate, inTwoWeeks)
        .then((appointments) => {
            let tests = [];
            for (let i = 0; i < appointments.length; i++) {
                const element = appointments[i];
                
                if ([2, 4, 5].includes(element.infoType)) {
                    tests.push(element);
                }
            }

            app.magister.tests = tests;
            app.isLoaded.tests = true;
        });
}

function refreshData() {
    resetLoadState();

    if (app.isRefreshCooldown) {
        return;
    }

    m.appointments(agendaDate, agendaDate)
        .then((appointments) => {
            app.magister.appointments = appointments;
            app.isLoaded.appointments = true;
        });

    refreshHomework();

    m.courses().then((courses) => {
        _.last(courses).grades()
            .then((grades) => {
                grades.sort(function (a, b) {
                    var dateA = new Date(a.dateFilledIn);
                    var dateB = new Date(b.dateFilledIn);
                    return dateB - dateA;
                });
                
                var validGrades = [];
                grades.forEach(i => {
                    if (i.counts && i.weight > 0)
                        validGrades.push(i);
                });
        
                app.magister.grades = grades;
                app.magister.insights = computeInsights();
                app.isLoaded.grades = true;

                refreshGraph(validGrades);
        });
    });
    
    m.messageFolders()
        .then((folders) => {
            folders[0].messages().then((messages) => {
                app.magister.messages = messages.messages;
                app.isLoaded.messages = true;
            });
        });
    
    m.assignments()
        .then((assignments) => {
            assignments.reverse();
            app.magister.assignments = assignments;
            app.isLoaded.assignments = true;
        });
}

app.profile.username = m.profileInfo.getFullName(false);
app.agendaDate = dayFormat;

m.courses().then((courses) => {
    var currentCourse = _.last(courses);
    const userDesc = [
        m.school.name,
        currentCourse.type.description,
        currentCourse.group.description
    ];

    app.profile.userDesc = userDesc.join(" - ");
});

if (m != null) {
    console.log("Successfully authenticated with Magister!");
} else {
    console.log("Unable to authenticate with Magister.");
}

ipcRenderer.send("content-loaded");
app.checkUpdates();

refreshData();
