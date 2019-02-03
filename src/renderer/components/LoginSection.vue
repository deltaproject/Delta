<template>
  <section id="login-section" class="fdb-block">
    <div class="container" v-if="!state.authenticated">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-8 col-xl-6">
          <div class="row">
            <div class="col text-center">
              <h1>Delta - Log In</h1>
            </div>
          </div>
          <div class="row align-items-center mt-4">
            <div class="col">
              <input type="text" name="school" class="form-control" list="schools" v-model="credentials.schoolname"
              placeholder="Schoolnaam" :class="{ 'is-invalid': state.errors.invalidSchoolname }"
              :disabled="state.busy || (guestMode && credentials.schoolname != '')" @keyup="getSchools()">

              <datalist id="schools">
                <option v-for="school in schoolQuery" :value="school.name"></option>
              </datalist>
            </div>
          </div>
          <div class="row align-items-center mt-4">
            <div class="col">
              <input type="text" name="username" class="form-control" v-model="credentials.username"
              placeholder="Gebruikersnaam" :class="{ 'is-invalid': state.errors.invalidCredentials }"
              :disabled="state.busy">
            </div>
            <div class="col">
              <input type="password" name="password" class="form-control" v-model="credentials.password"
              placeholder="Wachtwoord" :class="{ 'is-invalid': state.errors.invalidCredentials }"
              :disabled="state.busy">
            </div>
          </div>
          <div class="row align-items-center mt-4">
            <div class="col">
              <div class="form-check" v-if="!guestMode">
                <label class="form-check-label">
                  <input class="form-check-input" v-model="saveCredentials" name="saveCreds" type="checkbox" :disabled="state.busy">
                  Onthoud mij
                </label>
              </div>
              <div v-if="guestMode">
                <p>De gastmodus is ingeschakeld. Dit houdt in dat je gegevens niet worden opgeslagen.</p>
              </div>

              <button type="submit" class="btn btn-primary btn-block mt-4" @click="login()" :disabled="!isFormFilled || state.busy">
                Log in <i v-if="!state.busy" class="fa fa-chevron-right"></i><i v-if="state.busy" class="fa fa-spinner fa-spin"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  const { getSchools } = require('magister.js')
  const fs = require('fs')

  export default {
    name: 'login-section',
    data: function () {
      return {
        credentials: {
          schoolname: '',
          username: '',
          password: '',
          token: ''
        },
        guestMode: false,
        saveCredentials: true,
        schoolQuery: [],
        state: {
          authenticated: false,
          busy: true,
          errors: {
            invalidSchoolname: false,
            invalidCredentials: false
          }
        }
      }
    },
    computed: {
      isFormFilled () {
        return (this.credentials.schoolname.length > 0 &&
          this.credentials.username.length > 0 &&
          this.credentials.password.length > 0)
      }
    },
    methods: {
      getSchools () {
        if (this.credentials.schoolname.length > 2) {
          getSchools(this.credentials.schoolname).then((schools) => {
            this.schoolQuery = schools
          })
        }
      },
      login () {
      }
    },
    created () {
      // Should we run in guest mode?
      try {
        // Read the school name
        this.credentials.schoolname = JSON.parse(fs.readFileSync(this.$parent.files.schoolFile)).schoolname
        // Set guest mode to true
        this.guestMode = true
        // Set save credentials to false
        this.saveCredentials = false
      } catch (err) {
        // Handle any errors
        if (err.code === 'ENOENT') {
          console.log(`School file does not exist - running in standard mode.`)
        } else {
          console.log(`An unkown error occured trying to read the school file: ${err.message}`)
          console.log(`Running in standard mode.`)
        }
      }

      // Check if we are not a guest
      if (!this.guestMode) {
        try {
          // Try to load saved credentials
          var savedCredentials = JSON.parse(fs.readFileSync(this.$parent.files.credentialsFile))

          // Set any saved credentials
          this.credentials.schoolname = (savedCredentials.schoolname ? savedCredentials.schoolname : this.credentials.schoolname)
          this.credentials.username = (savedCredentials.username ? savedCredentials.username : this.credentials.username)
          this.credentials.token = (savedCredentials.token ? savedCredentials.token : this.credentials.token)
        } catch (err) {
          // Handle any errors
          if (err.code === 'ENOENT') {
            this.saveCredentials = false // Assume so because else the file would exist
            console.log(`Credentials file does not exist.`)
          } else {
            console.log(`An unkown error occured trying to read the credentials file: ${err.message}`)
          }
        }
      }

      this.state.busy = false
    }
  }
</script>

<style>
</style>