<template>
  <div id="app">
    <login-section ref="login-section"></login-section>
  </div>
</template>

<script>
  import LoginSection from '@/components/LoginSection'

  const { remote } = require('electron')
  const app = remote.app
  const path = require('path')

  const schoolFile = path.join(app.getPath('userData'), 'school.json')
  const credentialsFile = path.join(app.getPath('userData'), 'credentials.json')

  export default {
    name: 'delta',
    components: {
      LoginSection
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
