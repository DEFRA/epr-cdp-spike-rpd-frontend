import {
  uploadController,
  uploadDataController,
  uploadCompleteController,
  uploadErrorController
} from '~/src/server/upload/controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
const upload = {
  plugin: {
    name: 'upload',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/upload',
          ...uploadController
        },
        {
          method: 'POST',
          path: '/upload-data',
          options: {
            payload: {
              output: 'data',
              parse: true,
              allow: 'multipart/form-data',
              multipart: { output: 'stream' }
              // maxBytes: 1024 * 1024 * 10 // 10 MB limit
            }
          },
          ...uploadDataController
        },
        {
          method: 'GET',
          path: '/upload/complete',
          ...uploadCompleteController
        },
        {
          method: 'GET',
          path: '/upload/error',
          ...uploadErrorController
        }
      ])
    }
  }
}

export { upload }
