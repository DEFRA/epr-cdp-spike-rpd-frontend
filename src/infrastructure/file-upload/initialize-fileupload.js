import { config } from '~/src/config/index.js'
import { fetchProxyWrapper } from '~/src/infrastructure/helper/fetchProxyWrapper.js'

const initializeUpload = async (options = {}) => {
  const {
    redirect,
    callback,
    s3Bucket,
    s3Path,
    mimeTypes,
    maxFileSize,
    metadata
  } = options

  const endpointUrl = config.get('cdpUploaderUrl') + '/initiate'
  const response = await fetchProxyWrapper(
    endpointUrl,
    {
      method: 'POST',
      body: JSON.stringify({
        redirect,
        callback,
        s3Bucket,
        s3Path,
        mimeTypes,
        maxFileSize,
        metadata
      })
    },
    true
  )
  return await response.body
}

export { initializeUpload }
