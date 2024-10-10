import { getExportData, importData } from '@/core'
import { useFileDialog } from '@vueuse/core'

export function useImportData() {
  const { open, onChange } = useFileDialog({
    accept: '.json', // Set to accept only image files
    directory: false // Select directories instead of files if set true
  })

  onChange(async (files) => {
    if (files?.length !== 1) {
      return
    }
    const fileData = await files[0].text()
    importData(fileData)
  })
  return open
}

export function useExportData() {
  return async function () {
    const json = await getExportData()

    const blob = new Blob([json], {
      type: 'application/json'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'export.json'
    link.click()
  }
}
