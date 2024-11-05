<script setup lang="ts">
import { RouterView } from 'vue-router'
import { AlphaTip } from '@/component'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useNetwork } from '@vueuse/core';

const { isOnline } = useNetwork()

</script>

<template>
  <el-config-provider :locale="zhCn">
    <AlphaTip />
    <Suspense>
      <!-- 渐变闪烁的红色边框 -->
      <RouterView :class="isOnline ? '' : 'app-offline'" />
      <template #fallback> 正在启动中... </template>
    </Suspense>
  </el-config-provider>
</template>
<style lang="css" scoped>
.app-offline {
  @apply border-8 border-red-500 rounded-lg;
  @apply transition-all duration-300;
  @apply animate-pulse;
}
</style>
