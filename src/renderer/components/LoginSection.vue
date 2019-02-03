<template>
  <section id="login-section" class="fdb-block">
    <div class="container" v-if="!$parent.magister">
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
                <option v-for="school in schoolQuery" :value="school.name" :key="school.name"></option>
              </datalist>
            </div>
          </div>
          <div class="row align-items-center mt-4">
            <div class="col">
              <input type="text" name="username" class="form-control" v-model="credentials.username"
              placeholder="Gebruikersnaam" :class="{ 'is-invalid': state.errors.invalidUsername }"
              :disabled="state.busy">
            </div>
            <div class="col">
              <input type="password" name="password" class="form-control" v-model="credentials.password"
              placeholder="Wachtwoord" :class="{ 'is-invalid': state.errors.invalidPassword }"
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
  const { default: magister, getSchools } = require('magister.js')
  const fs = require('fs')
  const request = require('request')

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
          busy: true,
          errors: {
            invalidSchoolname: false,
            invalidUsername: false,
            invalidPassword: false
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
      getSchools (callback = undefined) {
        if (this.credentials.schoolname.length > 2) {
          getSchools(this.credentials.schoolname).then((schools) => {
            this.schoolQuery = schools

            if (callback) {
              callback(schools)
            }
          })
        }
      },
      login () {
        // Say that we are busy
        this.state.busy = true

        // Retrieve the school
        this.getSchools((schools) => {
          // Check if there is a school
          if (schools.length === 0) {
            this.state.errors.invalidSchoolname = true
            // We are done so reflect that in the state
            this.state.busy = false
          } else {
            // Let the user now the school name is correct
            this.state.errors.invalidSchoolname = false

            // Continue to authentication
            request('https://raw.githubusercontent.com/simplyGits/magisterjs-authcode/master/code.json', { json: true }, (err, res, code) => {
              // Our authentication parameters
              var authenticationParameters = {
                school: schools[0],
                username: this.credentials.username,
                password: this.credentials.password
              }

              // If we were able to fetch the authCode use it
              if (!err && res.statusCode === 200) {
                authenticationParameters.authCode = code
              }

              // Attempt to authenticate
              magister(authenticationParameters)
                .then((m) => {
                  this.state.errors.invalidPassword = false
                  this.state.errors.invalidUsername = false
                  // Set the magister instance in the main app
                  this.$parent.magister = m

                  // Get the token
                  this.credentials.token = m.token
                  // Remove the password for security
                  this.credentials.password = ''

                  if (this.saveCredentials) {
                    try {
                      fs.writeFileSync(this.$parent.files.credentialsFile,
                        `{"schoolname": "${this.credentials.schoolname}", "username": "${this.credentials.username}", "token": "${this.credentials.token}"}`
                      )
                    } catch (err) {
                      console.log(`An error occured while saving credentials: ${err.message}`)
                    }
                  }

                  // We are done so reflect that in the state
                  this.state.busy = false
                })
                .catch((err) => {
                  if (err.message === 'Invalid password') {
                    this.state.errors.invalidUsername = false // is correct else we get the 2nd error
                    this.state.errors.invalidPassword = true
                  } else if (err.message === 'Invalid username') {
                    this.state.errors.invalidUsername = true
                    this.state.errors.invalidPassword = true // just looks nice
                  }

                  // We are done so reflect that in the state
                  this.state.busy = false
                })
            })
          }
        })
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

      // Check if we have an authentication token
      if (this.credentials.token.length > 0) {
        // TODO: Authenticate using the token
      }

      this.state.busy = false
    }
  }
</script>

<style>
</style>