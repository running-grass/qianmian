<script lang="ts" setup>
import { getDb } from '@/core';
const props = defineProps<{
  keyword?: string
}>()

async function doSearch() {
  console.log('search', props.keyword)
  if (!props.keyword) return
  const db = await getDb()
  const list = await db.query(`SELECT * FROM todo_item WHERE title CONTAINS $keyword`, {
    keyword: props.keyword
  })
  console.log(list)
}

doSearch()
</script>
<template>
  <div>ss</div>
</template>
