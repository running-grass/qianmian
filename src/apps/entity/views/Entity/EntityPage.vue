<script setup lang="ts">
import { allEntity, currentWorkspace, getRichEntityById, type RichEntity } from '@/core'
import { nextTick, ref } from 'vue'
import RelationPanel from './components/RelationPanel.vue'
import AttributePanel from './components/AttributePanel.vue'
import { useRouter } from 'vue-router'
import { createEntity } from '@/core'
import { useAutoSaveEntity } from '@/core'
import { StringRecordId } from 'surrealdb'
import Drawer from 'primevue/drawer'

const { id: nid } = defineProps<{
  id: string | undefined
}>()

const allEntities = allEntity

const router = useRouter()

const currentObject = ref<RichEntity | null>(null)

if (nid && nid.startsWith('entity:')) {
  currentObject.value = await getRichEntityById(new StringRecordId(nid))
}

async function changeCurrentObject(entity: RichEntity) {
  currentObject.value = await getRichEntityById(entity.entity_id)
  router.push({
    name: 'entity',
    params: {
      id: entity.entity_id.toString()
    }
  })
}

const { triggerInput, triggerChange } = useAutoSaveEntity(currentObject)

const titleEl = ref<HTMLInputElement | null>(null)

// declare titleEl = Ref<HTMLInputElement | null>
async function createObjectLocal() {
  const oid = await createEntity(currentWorkspace.value.config.default_entity_identity, 'Page')

  currentObject.value = await getRichEntityById(oid)

  nextTick(() => {
    // 自动聚焦title
    titleEl.value?.focus()

    // 自动选中所有文本
    titleEl.value?.select()
  })
}

// 属性抽屉
const attrDrawer = ref(false)

// 关系抽屉
const relationDrawer = ref(false)
</script>

<template>
  <div class="flex w-full h-full overflow-hidden">
    <aside class="w-64 h-full bg-base-200 flex flex-col m-2 border-r-2 border-black select-none">
      <el-button type="primary" class="mt-4" @click="createObjectLocal">创建新对象</el-button>
      <el-divider />
      <ul class="flex-1 overflow-x-auto">
        <li v-for="entity in allEntities" :key="entity.title" @click="changeCurrentObject(entity)"
          class="cursor-pointer py-2 px-4 hover:bg-primary active:bg-primary border-b" :class="currentObject?.entity_id.toString() == entity.entity_id.toString() ? 'bg-primary' : ''
            ">
          {{ entity.title }}
        </li>
      </ul>
    </aside>

    <main class="flex-1 p-2 flex flex-col">
      <div v-if="!currentObject">
        <p class="text-2xl">请选择一个对象</p>
      </div>

      <div v-else class="flex-1 flex flex-col">
        <section class="w-full mb-4 flex items-center">
          <el-input ref="titleEl" class="px-4 py-2 input input-bordered flex-1 mr-4" type="text"
            v-model="currentObject.title" @input="triggerInput" @change="triggerChange" />
          <el-button class="mr-4" @click="attrDrawer = true">属性</el-button>
          <el-button class="mr-4" @click="relationDrawer = true">关系</el-button>
        </section>

        <el-input type="textarea" ref="contentEl"
          class="entity-content textarea textarea-bordered flex-1 w-full resize-none" v-model="currentObject.content"
          @input="triggerInput" @change="triggerChange" />
      </div>
    </main>
  </div>

  <Drawer v-if="currentObject" v-model:visible="attrDrawer">
    <AttributePanel :currentObject="currentObject" />
  </Drawer>
  <Drawer v-if="currentObject" v-model:visible="relationDrawer">
    <RelationPanel :currentObject="currentObject" />
  </Drawer>
</template>
<style scoped>
.entity-content :deep(.el-textarea__inner) {
  height: 100%;
}
</style>
