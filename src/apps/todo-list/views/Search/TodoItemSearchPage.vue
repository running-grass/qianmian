<script lang="ts" setup>
import { getDb } from '@/core';
import { ref } from 'vue'
const props = defineProps<{
  keyword?: string
}>()

const keyword = ref<string>(props.keyword ?? '')

async function doSearch() {
  console.log('search', keyword)
  if (!keyword.value) return
  const db = await getDb()
  const list = await db.query(`SELECT * FROM todo_item WHERE title CONTAINS $keyword`, {
    keyword: keyword.value
  })
  console.log(list)
}


doSearch()
</script>
<template>
  <div class="flex">
    <section class="flex-1 flex flex-col">
      <header>
        <el-input tabindex="1" class="flex-1" type="text" v-model="keyword" placeholder="添加一个事项"
          @keydown.enter="doSearch" />
      </header>

    </section>

  </div>

</template>
