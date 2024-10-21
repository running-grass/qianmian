<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { getDb, todoItemView, type TodoItem } from '@/core';
import { myDayjs } from '@/plugins/dayjs';

const db = await getDb()

const [list] = await db.query<[TodoItem[]]>('SELECT * FROM todo_item WHERE done = false', {})

console.log(list)
const events = list.filter(it => it.scheduled_start).map(item => {
  return {
    title: item.title,
    start: myDayjs(item.scheduled_start).format('YYYY-MM-DD'),
    end: myDayjs(item.scheduled_end ?? item.scheduled_start).format('YYYY-MM-DD'), // item.scheduled_end ?? item.scheduled_end!
  }
})
const calendarOptions = {
  plugins: [dayGridPlugin, interactionPlugin],
  timeZone: 'UTC+8',
  initialView: 'dayGridMonth',
  editable: true,
  selectable: true,
  events
}

</script>
<template>
  <FullCalendar :options="calendarOptions">
    <!-- <template v-slot:eventContent='arg'>
      <b>{{ arg.event.title }}</b>
    </template> -->
  </FullCalendar>
</template>
