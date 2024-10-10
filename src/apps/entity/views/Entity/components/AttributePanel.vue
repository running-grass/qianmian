<script setup lang="ts">
import { type Attribute, type RichEntity, allAttribute } from '@/core'
import { computed, ref, type Ref } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/solid'
import { createAttributes, getAttributesBy, type ObjectAttributeMixin } from '@/core'
import { AttributeValue } from '@/component'

const props = defineProps<{
  currentObject: RichEntity
}>()

const allAttrOptions = allAttribute

const currentAttrs = ref<Ref<ObjectAttributeMixin>[]>(
  (await getAttributesBy(props.currentObject.entity_id)).map((it) => ref(it))
)

async function changeCurrentAttrs() {
  currentAttrs.value = (await getAttributesBy(props.currentObject.entity_id)).map((it) => ref(it))
}

async function addNewAttr(attr: Attribute) {
  await createAttributes(props.currentObject.entity_id, attr.id)
  await changeCurrentAttrs()
}

const conputedAttrs = computed(() => {
  const hasOptions = new Set(currentAttrs.value.map((attr) => attr.value.attributeName))
  return allAttrOptions.value.filter((attr) => !hasOptions.has(attr.name))
})
</script>

<template>
  <section class="min-h-full w-full">
    <el-dropdown class="mb-2">
      <el-button type="primary">
        添加一个属性
        <PlusIcon class="ml-2 h-4 w-4" />
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="attr in conputedAttrs"
            :key="attr.id.toString()"
            @click="addNewAttr(attr)"
          >
            {{ attr.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <ul class="w-full">
      <li
        v-for="attr in currentAttrs"
        :key="attr.value.id.toString()"
        class="w-full mb-2 flex justify-between items-center"
      >
        <span>{{ attr.value.attributeName }}</span>
        <AttributeValue v-model="attr.value" />
      </li>
    </ul>
  </section>
</template>
