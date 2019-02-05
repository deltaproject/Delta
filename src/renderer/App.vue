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
  const axios = require('axios')
  const compareVersions = require('compare-versions')
  const os = require('os')
  const download = require('download')
  const fs = require('fs')

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
          update: {
            checking: false,
            downloading: false
          },
          cached: {
            profile: undefined
          },
          show: {
            settings: false
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
          this.update()
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
        this.state.show.settings = false
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
      },
      async update () {
        // Start with checking if there is an update
        this.state.update.checking = true

        try {
          // Get the latest release
          var release = (await axios.get('https://api.github.com/repos/deltaproject/Delta/releases/latest')).data
          // Get the version of the release
          var releaseVersion = (await axios.get(`https://raw.githubusercontent.com/deltaproject/Delta/${release.tag_name}/package.json`)).data.version
          var localVersion = app.getVersion()

          // Check if the remote version is newer
          this.state.update.checking = false // We are done checking
          // Note: if you local version is newer (git clone?) then you
          // can set this to !== 1 in order to test if downloading works.
          if (compareVersions(releaseVersion, localVersion) === 1) {
            this.state.update.downloading = true // From here we are downloading

            // Figure out what platform we're on
            var platform
            switch (os.type()) {
              case 'Windows_NT':
                platform = 'windows'
                break
              case 'Darwin':
                platform = 'macOS'
                break
              default:
                platform = 'linux'
            }

            // Figure out where from and to we should
            // download the update
            var downloadURL
            var fileName
            for (let i = 0; i < release.assets.length; i++) {
              if (release.assets[i].name.indexOf(platform) !== -1) {
                downloadURL = release.assets[i].browser_download_url
                fileName = release.assets[i].name
              }
            }

            var downloadPath = path.join(app.getPath('downloads'), fileName)
            console.log(downloadPath)
            console.log(downloadURL)

            // Check if we already downloaded the
            // update before
            if (!fs.existsSync(downloadPath)) {
              // File does not exist -> download it
              await download(downloadURL, downloadPath)
            }

            // Done downloading
            this.state.update.downloading = false

            // TODO: Let the user now the download is available.
          }
        } catch (err) {
          console.log(`An error occured whilst trying to update Delta: ${err.message}`)

          // Reset the states
          this.state.update.checking = false
          this.state.update.downloading = false
        }
      }
    }
  }
</script>

<style lang="scss">
  @import 'assets/scss/main/master.scss'
</style>
