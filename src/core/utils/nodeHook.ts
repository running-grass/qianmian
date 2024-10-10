import { updateEntity } from '@/core'
import type { RichEntity } from '@/core'
import { useSubscription } from '@vueuse/rxjs'
import { map, debounceTime, Subject, mergeWith } from 'rxjs'
import { onBeforeUnmount, type Ref } from 'vue'
import { useEventListener } from '@vueuse/core'

type SimpleEntity = Pick<RichEntity, 'entity_id' | 'title' | 'content'>
export function useAutoSaveEntity(currentEntity: Ref<SimpleEntity | null>) {
  const inputSubjuct$ = new Subject<unknown>()
  const changeSubjuct$ = new Subject<unknown>()

  const inputSubjuct$$ = inputSubjuct$.pipe(
    map(() => currentEntity.value!),
    debounceTime(2000)
  )

  const changeSubjuct$$ = changeSubjuct$.pipe(map(() => currentEntity.value!))

  const saveAction$ = new Subject<SimpleEntity>()

  useSubscription(
    inputSubjuct$$
      .pipe(mergeWith(changeSubjuct$$))
      .pipe(debounceTime(100))
      // .pipe(mergeWith(saveAction$))
      .pipe(debounceTime(10))
      .subscribe((entity: SimpleEntity) => {
        if (!entity) return
        console.debug('save', entity)

        updateEntity(entity.entity_id, {
          title: entity.title,
          content: entity.content
        })
      })
  )

  // 页面关闭前保存
  useEventListener(window, 'beforeunload', async () => {
    console.debug('beforeunload')
    if (currentEntity.value) {
      console.debug('need save')
      const entity = currentEntity.value
      saveAction$.next(entity)
    }
  })

  // 组件卸载之前保存
  onBeforeUnmount(() => {
    console.log('before unmount')
    if (currentEntity.value) {
      saveAction$.next(currentEntity.value)
    }
  })

  return {
    saveAction$,
    triggerInput: () => inputSubjuct$.next(null),
    triggerChange: () => changeSubjuct$.next(null)
  }
}
