import { ElMessage } from 'element-plus'
import { ResponseError } from 'surrealdb'

export function defaultHandleSurrealError(e: unknown) {
  if (e instanceof ResponseError) {
    ElMessage.error(
      e.message.replace('There was a problem with the database: An error occurred: ', '')
    )
  } else if (e instanceof Error) {
    ElMessage.error('登录失败')
  }
}
