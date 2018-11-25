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
const Vue = require("vue/dist/vue");
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

            if (initial)
                contentLoaded++;
        });
}

function refreshData(initial = false) {
    if (app.isRefreshCooldown) {
        return;
    }

    m.appointments(agendaDate, agendaDate)
        .then((appointments) => {
            app.magister.appointments = appointments;
            if (initial)
                contentLoaded++;
        });

    refreshHomework(true);

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
                    if (i.counts)
                        validGrades.push(i);
                });
        
                app.magister.grades = grades;
                app.magister.insights = computeInsights();

                refreshGraph(validGrades);
                if (initial)
                    contentLoaded++;
        });
    });
    
    m.messageFolders()
        .then((folders) => {
            folders[0].messages().then((messages) => {
                app.magister.messages = messages.messages;
                if (initial)
                    contentLoaded++;
            })
        });
    
    m.assignments()
        .then((assignments) => {
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

app.profile.username = m.profileInfo.getFullName(false);
app.agendaDate = dayFormat;

if (m != null) {
    console.log("Successfully authenticated with Magister!");
} else {
    console.log("Unable to authenticate with Magister.");
}

refreshData(true);
