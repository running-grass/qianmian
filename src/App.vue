<script setup lang="ts">
import { RouterView } from 'vue-router'
import { AlphaTip } from '@/component'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>

<template>
  <el-config-provider :locale="zhCn">
    <AlphaTip />
    <Suspense>
      <RouterView />
      <template #fallback> 正在启动中... </template>
    </Suspense>
  </el-config-provider>
</template>
