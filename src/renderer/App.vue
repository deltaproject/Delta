<template>
  <div id="app">
    <login-section ref="loginSection"></login-section>
    <status-bar ref="statusBar"></status-bar>
    <settings-flyout ref="settingsFlyout"></settings-flyout>

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
        },
        state: {
          busy: false,
          updating: false
        },
        cache: {
          profile: {
            name: ''
          }
        }
      }
    },
    methods: {
      login () {
        this.$refs.loginSection.login()
      },
      logout () {
        this.$refs.loginSection.logout()
      },
      loadData () {
        this.state.busy = true
      }
    }
  }
</script>

<style lang="scss">
  @import 'assets/scss/main/master.scss'
</style>
