/* eslint-disable no-console */
import * as fs from 'fs'
import path from 'path'
import { createLogger } from '~/src/server/common/helpers/logging/logger.js'

const __dirname = path.resolve()

/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
const uploadController = {
  handler: (request, h) => {
    return h.view('upload/index', {
      pageTitle: 'Upload your packaging data',
      heading: 'Upload your packaging data'
    })
  }
}

const uploadDataController = {
  handler: (request, h) => {
    const logger = createLogger()
    const fileUpload = request.payload.fileUpload
    logger.debug('File upload started')
    if (fileUpload?.hapi?.filename?.length !== 0) {
      const name = fileUpload.hapi.filename
      const path = __dirname + '/uploads/' + name
      const file = fs.createWriteStream(path)
      logger.debug('File found: ' + name)
      fileUpload.pipe(file)
      return h.redirect('/upload/complete')
    } else {
      logger.warn('No file selected')
      return h.redirect('/upload/error')
    }
  }
}

const uploadErrorController = {
  handler: (request, h) => {
    return h.view('upload/error', {
      pageTitle: 'Upload your packaging data',
      heading: 'Upload your packaging data'
    })
  }
}

const uploadCompleteController = {
  handler: (request, h) => {
    return h.view('upload/complete', {
      pageTitle: 'Upload successful',
      heading: 'Upload successful'
    })
  }
}

export {
  uploadController,
  uploadDataController,
  uploadErrorController,
  uploadCompleteController
}
