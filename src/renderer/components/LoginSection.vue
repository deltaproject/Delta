<template>
  <section id="login-section" class="fdb-block">
    <div class="container" v-if="!$parent.state.authenticated">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-8 col-xl-6">
          <div class="row">
            <div class="col text-center">
              <h1>Delta - Log In</h1>
            </div>
          </div>
          <div class="row align-items-center mt-4">
            <div class="col">
              <input type="text" name="school" class="form-control" list="schools" v-model="$parent.authentication.credentials.schoolname"
              placeholder="Schoolnaam" :class="{ 'is-invalid': $parent.state.errors.invalidSchoolname }"
              :disabled="$parent.state.authenticating || ($parent.authentication.isGuest && $parent.authentication.credentials.schoolname != '')" @keyup="$parent.getSchools()">

              <datalist id="schools">
                <option v-for="i in $parent.authentication.schoolQuery" :value="i.name"></option>
              </datalist>
            </div>
          </div>
          <div class="row align-items-center mt-4">
            <div class="col">
              <input type="text" name="username" class="form-control" v-model="$parent.authentication.credentials.username"
              placeholder="Gebruikersnaam" :class="{ 'is-invalid': $parent.state.errors.invalidCredentials }"
              :disabled="$parent.state.authenticating">
            </div>
            <div class="col">
              <input type="password" name="password" class="form-control" v-model="$parent.authentication.credentials.password"
              placeholder="Wachtwoord" :class="{ 'is-invalid': $parent.state.errors.invalidCredentials }"
              :disabled="$parent.state.authenticating">
            </div>
          </div>
          <div class="row align-items-center mt-4">
            <div class="col">
              <div class="form-check">
                <label class="form-check-label">
                  <input class="form-check-input" v-model="$parent.authentication.saveCredentials" name="saveCreds" type="checkbox" :disabled="$parent.state.authenticating">
                  Onthoud mij
                </label>
              </div>

              <button type="submit" class="btn btn-primary btn-block mt-4" @click="$parent.login()" :disabled="!isFormFilled || $parent.state.authenticating">
                Log in <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  export default {
    name: 'login-section',
    data: function () {
      return {
      }
    },
    methods: {
    },
    computed: {
      isFormFilled () {
        return (this.$parent.authentication.credentials.schoolname.length > 0 && this.$parent.authentication.credentials.username.length > 0 && this.$parent.authentication.credentials.password.length > 0)
      }
    }
  }
</script>

<style>
</style>