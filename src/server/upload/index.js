import { uploadController, uploadDataController } from "~/src/server/upload/controller.js";

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
              multipart: true
              // maxBytes: 1024 * 1024 * 10 // 10 MB limit
            }
          },
          ...uploadDataController
        }
      ])
    }
  }
}

export { upload }
