<script setup lang="ts">
import { useMouse } from '@vueuse/core'
import { reactive, watch } from 'vue'

import { vOnClickOutside } from '@vueuse/components'

const emit = defineEmits(['close'])

const visible = defineModel<boolean>({
  default: false
})

const popoverPosition = reactive({ left: '0', top: '0', padding: 0 })
const { x, y } = useMouse()

watch(visible, (val) => {
  if (val) {
    popoverPosition.left = x.value + 'px'
    popoverPosition.top = y.value + 'px'
  }
})

function closePopover() {
  visible.value = false
}

watch(visible, (val) => {
  if (!val) {
    emit('close')
  }
})
</script>
<template>
  <template v-if="visible">
    <el-popover
      :visible="visible"
      virtual-triggering
      placement="right"
      :popper-style="popoverPosition"
      popper-class="!w-auto !h-auto"
      :show-arrow="false"
    >
      <section v-on-click-outside="closePopover">
        <slot></slot>
      </section>
    </el-popover>
  </template>
</template>
