<template>
  <div id="app">
    <login-section></login-section>
    <status-bar></status-bar>
    <settings-flyout></settings-flyout>

    <div id="notifyContainer"></div>
  </div>
</template>

<script>
  import LoginSection from '@/components/LoginSection'
  import StatusBar from '@/components/StatusBar'
  import SettingsFlyout from '@/components/SettingsFlyout'

  const { getSchools } = require('magister.js')

  export default {
    name: 'delta',
    components: {
      LoginSection,
      StatusBar,
      SettingsFlyout
    },
    data: function () {
      return {
        authentication: {
          credentials: {
            schoolname: '',
            username: '',
            password: '',
            token: ''
          },
          isGuest: false,
          saveCredentials: true,
          schoolQuery: []
        },
        state: {
          authenticated: false,
          authenticating: false,
          errors: {
            invalidSchoolname: false,
            invalidCredentials: false
          }
        }
      }
    },
    methods: {
      getSchools () {
        if (this.authentication.credentials.schoolname.length > 2) {
          getSchools(this.authentication.credentials.schoolname).then((schools) => {
            this.authentication.schoolQuery = schools
          })
        }
      },
      login () {
        console.log('Logging in')
      }
    }
  }
</script>

<style>
</style>
