import { connectivityController } from '~/src/server/connectivity/controller.js'
import { makeConnectionController } from '~/src/server/connectivity/connections.js'
import { makePostConnectionController } from '~/src/server/connectivity/postconnections.js'

/**
 * Sets up the routes used in the /about page.
 * These routes are registered in src/server/router.js.
 */
const connectivity = {
  plugin: {
    name: 'connectivity',
    register: async (server) => {
      server.route([
        {
          method: 'GET',
          path: '/connectivity',
          ...connectivityController
        },
        {
          method: 'GET',
          path: '/connectivity/connections',
          ...makeConnectionController
        },
        {
          method: 'POST',
          path: '/connectivity/postconnections',
          ...makePostConnectionController
        }
      ])
    }
  }
}

export { connectivity }
