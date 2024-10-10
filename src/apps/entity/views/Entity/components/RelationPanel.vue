<script setup lang="ts">
import {
  allEntity,
  allRelation,
  getDb,
  StringRecordId,
  type Entity,
  type EntityRelation,
  type EntityRelationsId,
  type Relation,
  type RichEntity
} from '@/core'
import { computed, reactive } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  currentObject: RichEntity
}>()

const computedObjects = allEntity

// 处理关系
type ObjectRelations1 = EntityRelation & {
  out: Pick<Entity, 'id' | 'title'>
  relation: Pick<Relation, 'id' | 'name' | 'description'>
}

const selectFields = '*,out.title,out.id,relation.id,relation.name,relation.description'

type Relations = Pick<EntityRelation, 'in' | 'relation'> & {
  typeName: string
  typeDescription: string
  targets: Array<Pick<Entity, 'id' | 'title'> & { relationId: EntityRelationsId }>
  vModel: string[]
}

const allRelationTypes = allRelation

const relationMap = reactive<Map<string, Relations>>(new Map())

function getRelationTypeObjBy(objRel: ObjectRelations1): Relations {
  const typeId = objRel.relation.id.toString()
  if (!relationMap.has(typeId)) {
    relationMap.set(typeId, {
      in: objRel.in,
      relation: objRel.relation.id,
      typeName: objRel.relation.name,
      typeDescription: objRel.relation.description,
      targets: [],
      vModel: []
    })
  }

  const relation = relationMap.get(typeId)

  return relation!
}

function addTargetTo(relation: Relations, targetRel: ObjectRelations1) {
  relation.targets.push({
    id: targetRel.out.id,
    title: targetRel.out.title,
    relationId: targetRel.id
  })

  relation.vModel.push(targetRel.out.id.toString())
}

function changeCurrentRelations() {
  relationMap.clear()
  getDb().then(async (db) => {
    const [res] = await db.query<[ObjectRelations1[]]>(
      `SELECT ${selectFields} FROM entity_relations WHERE in = $entity`,
      { entity: props.currentObject.entity_id }
    )
    for (const rel of res) {
      const rela = getRelationTypeObjBy(rel)
      addTargetTo(rela, rel)
    }
  })
}

async function updateRelationsByType(relation: Relations) {
  const db = await getDb()
  const [res] = await db.query<[ObjectRelations1[]]>(
    `SELECT ${selectFields} FROM entity_relations WHERE in = $entity AND relation = $relation`,
    { entity: props.currentObject.entity_id, relation: relation.relation }
  )
  const targets = []
  const vModels = []
  for (const rel of res) {
    targets.push({
      id: rel.out.id,
      title: rel.out.title,
      relationId: rel.id
    })
    vModels.push(rel.out.id.toString())
  }

  relation.targets = targets
  relation.vModel = vModels
}

async function updateRelation(relation: Relations) {
  const db = await getDb()

  const models = relation.vModel
  const targets = relation.targets

  const exists: string[] = []
  const promises: Promise<unknown>[] = []
  for (const target of targets) {
    // 无变动
    if (models.includes(target.id.toString())) {
      exists.push(target.id.toString())
      continue
    }

    promises.push(db.delete(target.relationId))
  }
  models
    .filter((id) => !exists.includes(id))
    .forEach((id) => {
      promises.push(
        db.relate(relation.in, 'entity_relations', new StringRecordId(id), {
          relation: relation.relation
        })
      )
    })

  Promise.all(promises).then(() => {
    updateRelationsByType(relation)
  })
}

function addNewRelation(rela: Relation) {
  const typeId = rela.id.toString()

  if (relationMap.has(typeId)) {
    throw new Error('Relation type already exists')
  }
  relationMap.set(typeId, {
    in: props.currentObject.entity_id,
    relation: rela.id,
    typeName: rela.name,
    typeDescription: rela.description,
    targets: [],
    vModel: []
  })
}

const conputedRelationOpts = computed(() => {
  return allRelationTypes.value
    .filter((attr) => !relationMap.has(attr.id.toString()))
    .map((rela) => ({
      ...rela,
      idStr: rela.id.toString()
    }))
})

changeCurrentRelations()
</script>

<template>
  <section class="min-h-full w-full">
    <el-dropdown>
      <el-button type="primary">
        添加一个关系
        <PlusIcon class="ml-2 h-4 w-4" />
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="rela in conputedRelationOpts"
            :key="rela.id.toString()"
            @click="addNewRelation(rela)"
          >
            {{ rela.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <ul class="w-full">
      <li
        v-for="[typeId, relation] of relationMap.entries()"
        :key="typeId"
        class="w-full mb-2 flex justify-between items-center"
      >
        <span>{{ relation.typeName }}</span>
        <el-select-v2
          v-model="relation.vModel"
          :props="{ label: 'title', value: 'entity_id' }"
          :options="computedObjects"
          placeholder="请选择"
          style="width: 240px"
          multiple
          @change="updateRelation(relation)"
        />
      </li>
    </ul>
  </section>
</template>
