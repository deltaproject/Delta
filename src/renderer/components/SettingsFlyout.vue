<template>
    <transition name="settings">
      <div class="settingsMenu no-select" v-show="isSettingsMenu">
          <div class="closeSettings" @click="toggleSettings()">
              <i class="fas fa-times"></i>
          </div>

          <h1 class="username-big">{{ profile.username }}</h1>
          <h2 class="userDesc">{{ profile.userDesc }}</h2>
          <p class="btnSignOff" title="Meld je af bij Delta" @click="signOff()">Afmelden</p>
      </div>
    </transition>
</template>

<script>
export default {

}
</script>

<style>
</style>
