<script setup lang="ts">
import { currentAccount } from '@/core/built-in/account'
import { pomodoroEventSlug } from '@/core/built-in/entityEvent'
import { createEntityEventLog } from '@/core/sql/eventLog'
import { myDayjs } from '@/plugins/dayjs'
import { useIntervalFn, useStorage, useTitle } from '@vueuse/core'
import Button from 'primevue/button'
import Knob from 'primevue/knob'
import { computed } from 'vue'
import { z } from 'zod'

const tabTitle = useTitle('千面番茄')

const pomodoroConfig = currentAccount.value.config.pomodoro

const PomodoroStatusValidator = z.enum([
  'inactive',
  'pomodoro',
  'finish',
  'short_break',
  'long_break',
  'finish_break'
])
const CurrentPomodoroValidator = z.object({
  /** 是否激活 */
  status: PomodoroStatusValidator.default('inactive'),

  /** 番茄时长(分钟) */
  pomodoro_time: z.number().int().positive().default(pomodoroConfig.pomodoro_time),

  break_time: z.number().int().positive().default(pomodoroConfig.short_break_time),

  /** 开始时间 */
  start_time: z
    .number()
    .positive()
    .default(() => myDayjs().unix()),
  break_start_time: z
    .number()
    .positive()
    .default(() => myDayjs().unix())
})

type CurrentPomodoro = z.infer<typeof CurrentPomodoroValidator>

const currentPomodoro = useStorage<CurrentPomodoro>('currentPomodoro', () =>
  CurrentPomodoroValidator.parse({})
)

currentPomodoro.value = CurrentPomodoroValidator.parse(currentPomodoro.value)

const shortBreakTimes = useStorage<number>('shortBreakTimes', () => 0)

const process = useStorage<number>('pomodoroProcess', 0)
const timeText = useStorage<string>('pomodoroTimeText', '')

const pomodoroStartTime = computed(() => {
  return myDayjs(currentPomodoro.value.start_time * 1000)
})
const pomodoroEndTime = computed(() => {
  return pomodoroStartTime.value.add(currentPomodoro.value.pomodoro_time, 'minute')
})

Notification.requestPermission()

function showNotification(title: string, body?: string): Notification {
  return new Notification(title, { body })
}

const { pause: pausePomodoroInterval, resume: resumePomodoroInterval } = useIntervalFn(
  () => {
    const diffTime = myDayjs.duration(pomodoroEndTime.value.diff(myDayjs()))
    process.value = 100 - (diffTime.asMinutes() / currentPomodoro.value.pomodoro_time) * 100
    timeText.value = diffTime.format('mm:ss')

    tabTitle.value = `${timeText.value} - 千面番茄`
    if (pomodoroEndTime.value.isBefore(myDayjs())) {
      finishPomodoro()
      tabTitle.value = '千面番茄'
    }
  },
  100,
  { immediate: false }
)

function startPomodoro() {
  showNotification('开始一个番茄')
  currentPomodoro.value = {
    ...currentPomodoro.value,
    status: 'pomodoro',
    pomodoro_time: pomodoroConfig.pomodoro_time,
    start_time: myDayjs().unix()
  }
  process.value = 0
  resumePomodoroInterval()
}

async function finishPomodoro() {
  pausePomodoroInterval()
  currentPomodoro.value.status = 'finish'
  process.value = 0
  let notification
  if (nextBreakType.value === 'short_break') {
    timeText.value = `${pomodoroConfig.short_break_time}:00`
    notification = showNotification(
      '恭喜你，完成一个番茄',
      `点击开始休息${pomodoroConfig.short_break_time}分钟吧`
    )
  } else {
    timeText.value = `${pomodoroConfig.long_break_time}:00`
    notification = showNotification(
      '恭喜你，完成一个番茄',
      `点击开始休息${pomodoroConfig.long_break_time}分钟吧`
    )
  }

  notification.onclick = () => {
    if (nextBreakType.value === 'short_break') {
      startShortBreak()
    } else {
      startLongBreak()
    }
  }

  await createEntityEventLog(pomodoroEventSlug, {
    pomodoro_time: currentPomodoro.value.pomodoro_time
  })
}

// 休息部分
const breakEndTime = computed(() => {
  return myDayjs(currentPomodoro.value.break_start_time * 1000).add(
    currentPomodoro.value.break_time,
    'minute'
  )
})
const { pause: pauseBreakInterval, resume: resumeBreakInterval } = useIntervalFn(
  () => {
    const diffTime = myDayjs.duration(breakEndTime.value.diff(myDayjs()))
    process.value = 100 - (diffTime.asMinutes() / currentPomodoro.value.break_time) * 100
    timeText.value = diffTime.format('mm:ss')

    if (diffTime.asSeconds() <= 0) {
      finishBreak()
    }
  },
  100,
  { immediate: false }
)

const nextBreakType = computed(() => {
  if (shortBreakTimes.value >= pomodoroConfig.break_interval) {
    return 'long_break'
  } else {
    return 'short_break'
  }
})

function finishBreak() {
  pauseBreakInterval()
  process.value = 0
  timeText.value = `${pomodoroConfig.pomodoro_time}:00`
  currentPomodoro.value.status = 'finish_break'
  const notification = showNotification('完成一个休息', '单击再次开始番茄')

  notification.onclick = () => {
    startPomodoro()
  }
}

function startShortBreak() {
  shortBreakTimes.value++
  process.value = 0
  currentPomodoro.value = {
    ...currentPomodoro.value,
    status: 'short_break',
    break_time: pomodoroConfig.short_break_time,
    break_start_time: myDayjs().unix()
  }
  resumeBreakInterval()
  showNotification('开始一个短休息')
}

function startLongBreak() {
  shortBreakTimes.value = 0
  process.value = 0
  currentPomodoro.value = {
    ...currentPomodoro.value,
    status: 'long_break',
    break_time: pomodoroConfig.long_break_time,
    break_start_time: myDayjs().unix()
  }
  resumeBreakInterval()

  showNotification('开始一个长休息')
}

if (currentPomodoro.value.status === 'pomodoro') {
  resumePomodoroInterval()
} else if (
  currentPomodoro.value.status === 'short_break' ||
  currentPomodoro.value.status === 'long_break'
) {
  resumeBreakInterval()
}

function exitPomodoro() {
  pausePomodoroInterval()
  pauseBreakInterval()
  currentPomodoro.value.status = 'inactive'
  timeText.value = `${pomodoroConfig.pomodoro_time}:00`
  process.value = 0
}

const statusText = computed<string>(() => {
  switch (currentPomodoro.value.status) {
    case 'pomodoro':
      return '番茄工作中'
    case 'short_break':
      return '短休息中'
    case 'long_break':
      return '长休息中'
    case 'finish_break':
      return '休息结束'
    case 'finish':
      return '番茄结束'
    case 'inactive':
      return '未开始'
    default:
      return ''
  }
})
</script>

<template>
  <section class="w-full h-full flex flex-col items-center justify-center">
    <header class="text-3xl">{{ statusText }}</header>
    <section class="relative">
      <Knob
        :model-value="process"
        readonly
        :showValue="false"
        rangeColor="MediumTurquoise"
        valueColor="SlateGray"
        :size="400"
      ></Knob>
      <span
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold"
        >{{ timeText }}</span
      >
    </section>
    <Button
      v-if="['inactive', 'finish_break'].includes(currentPomodoro.status)"
      label="开始番茄"
      class="mt-4"
      @click="startPomodoro"
    ></Button>

    <Button
      v-if="currentPomodoro.status === 'finish' && nextBreakType === 'short_break'"
      label="开始短休息"
      class="mt-4"
      @click="startShortBreak"
    ></Button>
    <Button
      v-else-if="currentPomodoro.status === 'finish' && nextBreakType === 'long_break'"
      label="开始长休息"
      class="mt-4"
      @click="startLongBreak"
    ></Button>

    <Button
      v-if="currentPomodoro.status !== 'inactive'"
      label="退出番茄"
      class="mt-4"
      @click="exitPomodoro"
      severity="warn"
    ></Button>
  </section>
</template>
