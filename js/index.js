/* globals app, computeInsights, refreshGraph */
const { default: magister, getSchools } = require('magister.js') // eslint-disable-line no-unused-vars
const { remote, ipcRenderer } = require('electron') // eslint-disable-line no-unused-vars
const { spawn } = require('child_process') // eslint-disable-line no-unused-vars
const path = require('path')
const url = require('url') // eslint-disable-line no-unused-vars
const os = require('os') // eslint-disable-line no-unused-vars
const moment = require('moment')
const _ = require('lodash')
const fs = require('fs')
const electron = remote.app
const shell = remote.shell // eslint-disable-line no-unused-vars
const dialog = remote.dialog // eslint-disable-line no-unused-vars
const download = require('download') // eslint-disable-line no-unused-vars
const Vue = require('vue/dist/vue') // eslint-disable-line no-unused-vars
var $ = require('jquery/dist/jquery') // eslint-disable-line no-unused-vars
moment.locale('nl')

const credsFile = path.join(electron.getPath('userData'), 'delta.json')

let m
var today = new Date()
var agendaDate = new Date()
var inTwoWeeks = new Date()

if ([5, 6].includes(today.getDay())) {
  agendaDate.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7)
} else {
  agendaDate.setDate(today.getDate() + 1)
}

var dayFormat = moment(agendaDate).format('dddd')
inTwoWeeks = moment(inTwoWeeks).add(14, 'days').toDate()
app.agendaDate = dayFormat

function resetLoadState () {
  const keys = [
    'appointments', 'messages', 'grades',
    'assignments', 'tests', 'insights',
    'files'
  ]

  keys.forEach(key => {
    if (app.isLoaded.hasOwnProperty(key)) {
      app.isLoaded[key] = false
    }

    if (app.magister.hasOwnProperty(key)) {
      app.magister[key] = []
    }
  })
}

function refreshHomework () {
  m.appointments(agendaDate, inTwoWeeks)
    .then((appointments) => {
      let tests = []
      for (let i = 0; i < appointments.length; i++) {
        const element = appointments[i]

        if ([2, 4, 5].includes(element.infoType)) {
          tests.push(element)
        }
      }

      app.magister.tests = tests
      app.isLoaded.tests = true
    })
}

function refreshData () {
  resetLoadState()

  if (app.isRefreshCooldown) {
    return
  }

  m.appointments(agendaDate, agendaDate)
    .then((appointments) => {
      app.magister.appointments = appointments
      app.isLoaded.appointments = true
    })

  refreshHomework()

  m.courses().then((courses) => {
    _.last(courses).grades()
      .then((grades) => {
        // Sort by newest grades first
        grades.sort(function (a, b) {
          var dateA = new Date(a.dateFilledIn)
          var dateB = new Date(b.dateFilledIn)
          return ((dateA > dateB) ? -1 : ((dateA < dateB) ? 1 : 0))
        })

        var validGrades = []
        grades.forEach(i => {
          if (i.counts && i.weight > 0 && i.type._type === 1) {
            validGrades.push(i)
          }
        })

        app.magister.grades = grades
        app.magister.insights = computeInsights()
        app.isLoaded.grades = true

        refreshGraph(validGrades)
      })
  })

  m.messageFolders()
    .then((folders) => {
      folders[0].messages().then((messages) => {
        app.magister.messages = messages.messages
        app.isLoaded.messages = true
      })
    })

  m.assignments()
    .then((assignments) => {
      assignments.reverse()
      app.magister.assignments = assignments
      app.isLoaded.assignments = true
    })

  m.fileFolders()
    .then((folders) => {
      app.magister.files = folders
      app.isLoaded.files = true
    })
}

function initData () { // eslint-disable-line no-unused-vars
  m = remote.getGlobal('m')

  if (m != null) {
    console.log('Successfully authenticated with Magister!')
  } else {
    console.log('Unable to authenticate with Magister.')
  }

  m.courses().then((courses) => {
    var currentCourse = _.last(courses)
    const userDesc = [
      m.school.name,
      currentCourse.type.description,
      currentCourse.group.description
    ]

    app.profile.userDesc = userDesc.join(' - ')
  })

  app.profile.username = m.profileInfo.getFullName(false)
  refreshData()
  app.checkUpdates()
}

if (remote.process.argv.includes('--guest')) {
  const schoolIndex = remote.process.argv.indexOf('--guest') + 1
  const schoolName = remote.process.argv[schoolIndex]

  if (schoolName) {
    app.auth.creds.school = schoolName
    app.auth.isGuest = true
    app.auth.saveCreds = false
  }
} else {
  if (fs.existsSync(credsFile)) {
    let rawJson = fs.readFileSync(credsFile)
    app.auth.creds = _.merge(app.auth.creds, JSON.parse(rawJson))
    app.login(true)
  }
}

document.getElementById('authContainer').addEventListener('keyup', (event) => {
  if (event.keyCode === 13 && app.isAuthFormFilled && !app.auth.isBusy) {
    app.login()
  }
})
