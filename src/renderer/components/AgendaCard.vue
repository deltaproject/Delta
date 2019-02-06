<template>
  <div class="card" id="agenda">
    <h1>Agenda <span>voor {{ agendaDate }}</span></h1>
    <div :class="{ bigList: magister.appointments.length > 0 }">
      <div class="cardLoading" v-if="!isLoaded.appointments">
        <i class="fas fa-circle-notch spin"></i>
      </div>

      <div v-if="magister.appointments.length == 0 && isLoaded.appointments" class="no-info">
        <i class="far fa-calendar"></i>
        <p>Geen afspraken voor {{ agendaDate }}.</p>
      </div>

      <div v-for="i in magister.appointments" class="bigListItem" :class="{ scrapped: i.isCancelled }" @click="showAppointmentInfo(i)">
        <div class="itemContainer calendarItem">{{ i.startBySchoolhour }}</div>
        <div v-if="i.startBySchoolhour != i.endBySchoolhour" class="itemContainer calendarItem">{{ i.endBySchoolhour }}</div>
        <div class="itemDesc">
          <p>
            {{ i.classes[0] != null ? i.classes[0] : i.description }}
            <span> {{ formatTime(i.start) }} - {{ formatTime(i.end) }} </span>
            <span class="location">{{ i.location }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    methods: {
      getAppointments(from = new Date(), to = new Date()) {
        return this.$parent.cache.appointments.filter((appointment) => {
          // We never fetch a whole year so no need to check for that
          return ((appointment.start.getMonth() >= from.getMonth() && appointment.start.getDate() >= from.getDate()) &&
            (appointment.start.getMonth() <= to.getMonth() && appointment.start.getDate() <= to.getDate()))
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
