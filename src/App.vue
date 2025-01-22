<script setup lang="ts">
import { RouterView } from 'vue-router'
import { AlphaTip } from '@/component'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useDbConnected } from './core/utils/network';
import { getDb } from './core';
import { onMounted, ref, watch } from 'vue';

const dbConnected = ref(true);

onMounted(async () => {
  const db = await getDb()
  const _dbConnected = useDbConnected(db);
  watch(_dbConnected, (newValue) => {
    dbConnected.value = newValue;
  })
})
</script>

<template>
  <el-config-provider :locale="zhCn">
    <AlphaTip />
    <Suspense>
      <!-- 渐变闪烁的红色边框 -->
      <RouterView :class="dbConnected ? '' : 'app-offline'" />
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
