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
