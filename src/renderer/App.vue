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
          updating: false,
          cached: {
            profile: undefined
          }
        },
        cache: {
          profile: {
            name: ''
          }
        }
      }
    },
    watch: {
      magister (newMagister, oldMagister) {
        if (newMagister !== undefined && oldMagister === undefined) {
          // The user most likely logged in
          this.loadCache()
        } else if (newMagister === undefined && oldMagister !== undefined) {
          // The user most likely logged out
          this.clearCache()
        }
      },
      'state.cached': {
        deep: true,
        handler (newCached, oldCached) {
          // Check if anything has not been cached yet
          var cachedValues = Object.values(newCached)
          for (var i = cachedValues.length - 1; i >= 0; i--) {
            if (cachedValues[i] === false) {
              // If so then we are busy
              this.state.busy = true
              return
            }
          }

          // Everything has been cached -> not busy
          this.state.busy = false
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
      clearCache () {
        // Reset cache
        var cachedKeys = Object.keys(this.state.cached)
        for (var i = cachedKeys.length - 1; i >= 0; i--) {
          this.state.cached[cachedKeys[i]] = false
        }
      },
      loadCache () {
        this.clearCache()

        // Cache profile data
        this.cache.profile.name = this.magister.profileInfo.getFullName()
        this.state.cached.profile = true
      }
    }
  }
</script>

<style lang="scss">
  @import 'assets/scss/main/master.scss'
</style>
