import React, { useEffect } from 'react'
import { Global } from '@emotion/core'
import { globalStyles } from '../styles'
import { useApp } from '../contexts/AppContext'
import { useImages } from '../contexts/ImagesContext'
import { Stack, Button } from '../elements'
import FilePickerBar from './FilePickerBar'
import TinyfyBar from './TinyfyBar'
import ImageList from './ImageList'
import { filePathsToImages } from '../utils'
import {
  imageActionType,
  imageStatus,
  READY_TO_COMPRESS,
  COMPRESSION_START,
  COMPRESSION_STATUS,
} from '../constants/common'

const App = () => {
  const { app, setApp } = useApp()
  const { images, dispatchImages } = useImages()

  useEffect(() => {
    window.electron.ipc.on(COMPRESSION_STATUS, (e, compressing) => {
      setApp(state => ({ ...state, compressing }))
    })
  }, [setApp])

  const handleAddMore = async () => {
    const filePaths = await window.electron.dialog.getImagesFromUser()

    filePaths &&
      dispatchImages({
        type: imageActionType.ADD,
        payload: filePathsToImages(filePaths),
      })
  }

  const handleRemoveSlected = () => {
    dispatchImages({
      type: imageActionType.REMOVE_SELECTED,
    })
  }

  const handleCompress = () => {
    const filePaths = Array.from(images)
      .filter(
        ([, { status }]) =>
          status === READY_TO_COMPRESS || status === imageStatus.FAILED
      )
      .map(([key]) => key)

    if ('apiKye' in app && app.apiKey) {
      localStorage.setItem('apiKey', app.apiKey)
    }

    window.electron.ipc.send(COMPRESSION_START, { filePaths, app })
  }

  const { compressing } = app

  return (
    <div className="App">
      <Global styles={globalStyles} />
      <FilePickerBar />
      <TinyfyBar />
      <ImageList />
      <Stack>
        <Button onClick={handleAddMore} disabled={compressing}>
          Add more
        </Button>
        <Button onClick={handleRemoveSlected} disabled={compressing}>
          Remove selected
        </Button>
        <Button onClick={handleCompress} disabled={compressing}>
          Compress images
        </Button>
      </Stack>
    </div>
  )
}

export default App
