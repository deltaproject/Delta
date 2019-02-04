<template>
    <div class="statusBar no-select" v-if="$parent.magister">
        <h1 class="title-big">
            <span>Project: </span>Delta
            <i class="btnRefresh fas fa-sync-alt" title="Ververs gegevens"
            :class="{ disabled: $parent.state.busy, spin: $parent.state.busy }"
            v-on:click="$parent.loadData()"></i>
        </h1>

        <div class="profileInfo">
            <div class="update" v-if="$parent.state.updating">
                <span title="Delta is een update aan het downloaden">Updaten<i>...</i></span>
            </div>
            <h1 class="username">{{ $parent.cache.profile.username }}</h1>
            <img class="profileIcon" src="../assets/imgs/user.png" title="Instellingen en profiel" @click="toggleSettings()">
        </div>
    </div>
</template>

<script>
export default {

}
</script>

<style>
</style>
