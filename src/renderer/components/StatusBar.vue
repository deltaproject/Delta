<template>
    <div class="statusBar no-select" v-show="auth.loginSuccess">
        <h1 class="title-big">
            <span>Project: </span>Delta<span class="beta-badge" v-if="isBeta"></span>
            <i class="btnRefresh fas fa-sync-alt" title="Ververs gegevens"
            @click="setRefreshCooldown()"
            :class="{ disabled: isRefreshCooldown, spin: isRefreshCooldown }"
            onclick="refreshData()"></i>
        </h1>

        <div class="profileInfo">
            <div class="update" v-if="isUpdateRunning">
                <span>Updaten<i>...</i></span>
            </div>
            <h1 class="username">{{ profile.username }}</h1>
            <img class="profileIcon" :src="profile.imgUrl" title="Instellingen en profiel" @click="toggleSettings()">
        </div>
    </div>
</template>

<script>
export default {

}
</script>

<style>
</style>
