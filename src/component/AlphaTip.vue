<script setup lang="ts">
import { APP_VERSION } from '@/core';
import { useSessionStorage } from '@vueuse/core'
import { ElMessageBox } from 'element-plus'

const readTip = useSessionStorage('readTip', false)

if (!readTip.value) {
  ElMessageBox.alert(
    `本项目处于开发早期，仅用于内部测试。数据备份周期为1小时，如有数据丢失请联系开发者反馈。<br/><br/><b>当前版本为 ${APP_VERSION}</b>`,
    '警告',
    {
      confirmButtonText: '我知道了',
      dangerouslyUseHTMLString: true,
      type: 'warning'
    }
  ).then(() => {
    readTip.value = true
  })
}
</script>
<template>
  <div class="hidden"></div>
</template>
