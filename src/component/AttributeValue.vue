<script setup lang="ts">
import { changeAttribute, type ObjectAttributeMixin } from '@/core'

const attr = defineModel<ObjectAttributeMixin>({ required: true })

function changeAttrLocal() {
  changeAttribute(attr.value.id, attr.value.entityId, attr.value.attributeId, attr.value.data)
}
</script>

<template>
  <input v-if="attr.attributeType === 'string'" type="text" v-model="attr.data" class="input"
    @change="changeAttrLocal" />
  <el-switch v-else-if="attr.attributeType === 'boolean'" @change="changeAttrLocal" v-model="attr.data as boolean" />
  <el-select v-else-if="attr.attributeType === 'enum'" v-model="attr.data as string" placeholder="Select" size="large"
    style="width: 240px" @change="changeAttrLocal">
    <el-option v-for="item in attr.attributeEnums" :key="item" :label="item" :value="item" />
  </el-select>
  <el-date-picker v-else-if="attr.attributeType === 'datetime'" v-model="attr.data as Date" type="datetime"
    placeholder="请选择时间" @change="changeAttrLocal" />
  <span v-else>{{ attr.data }}</span>
</template>
