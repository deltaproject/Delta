<template>
  <div id="app">
    <login-section ref="login-section"></login-section>
    <status-bar></status-bar>
    <settings-flyout></settings-flyout>

    <div id="notifyContainer"></div>
  </div>
</template>

<script>
  import LoginSection from '@/components/LoginSection'
  import StatusBar from '@/components/StatusBar'
  import SettingsFlyout from '@/components/SettingsFlyout'

  const { remote } = require('electron')
  const app = remote.app
  const path = require('path')
  
  const schoolFile = path.join(app.getPath('userData'), 'school.json')
  const credentialsFile = path.join(app.getPath('userData'), 'credentials.json')

  export default {
    name: 'delta',
    components: {
      LoginSection,
      StatusBar,
      SettingsFlyout
    },
    data: function () {
      return {
        files: {
          schoolFile: schoolFile,
          credentialsFile: credentialsFile
        }
      }
    },
    methods: {
    }
  }
</script>

<style>
</style>
