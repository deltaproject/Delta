<template>
  <div id="app">
    <login-section ref="login-section"></login-section>
    <status-bar ref="status-bar"></status-bar>
    <settings-flyout ref="settings-flyout"></settings-flyout>

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

  export default {
    name: 'delta',
    components: {
      LoginSection,
      StatusBar,
      SettingsFlyout
    },
    data: function () {
      return {
        magister: undefined,
        files: {
          schoolFile: path.join(app.getPath('userData'), 'school.json'),
          credentialsFile: path.join(app.getPath('userData'), 'credentials.json')
        }
      }
    },
    methods: {
    }
  }
</script>

<style>
</style>
