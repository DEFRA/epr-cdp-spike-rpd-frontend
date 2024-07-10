import 'multer'
const upload = multer({ dest: 'uploads/' })

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

  }
}

export { uploadController, uploadDataController }
