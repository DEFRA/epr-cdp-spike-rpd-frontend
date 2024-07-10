/* eslint-disable no-console */
import * as fs from 'fs'
import path from 'path'
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

    const fileUpload = request.payload.fileUpload
    console.log('********************')
    if (
      fileUpload &&
      fileUpload.hapi.filename &&
      fileUpload.hapi.filename.length !== 0
    ) {
      console.log('Have File')
      const name = fileUpload.hapi.filename
      const path = __dirname + '/uploads/' + name
      console.log('path:' + path)
      const file = fs.createWriteStream(path)

      file.on('error', (err) => {
        console.error(err)
        return h.redirect('/upload/error')
      })

      fileUpload.pipe(file)

      fileUpload.on('end', () => {
        const ret = {
          filename: fileUpload.hapi.filename,
          headers: fileUpload.hapi.headers
        }
        return JSON.stringify(ret)
      })
    } else {
      console.log('No File')
      return h.redirect('/upload/error')
    }
    return h.redirect('/upload/complete')
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

export { uploadController, uploadDataController, uploadErrorController, uploadCompleteController }
