import {
  uploadController,
  uploadDataController
} from '~/src/server/upload/controller.js'

describe('#uploadController', () => {
  const mockViewHandler = {
    view: jest.fn(),
    response: jest.fn().mockReturnThis(),
    code: jest.fn().mockReturnThis()
  }

  test('Should provide expected response', () => {
    uploadController.handler(null, mockViewHandler)
    expect(mockViewHandler.view).toHaveBeenCalled()
  })
})

describe('#uploadDataController', () => {
  const mockViewHandler = {
    redirect: jest.fn(() => {
      return new Promise(() => {})
    }),
    payload: jest.fn()
  }

  const mockRequest = {
    payload: {
      fileUpload: {
        hapi: {
          filename: 'testfile.txt',
          headers: {}
        },
        pipe: jest.fn(),
        on: jest.fn((event, callback) => {
          if (event === 'end') {
            callback()
          }
        })
      }
    }
  }

  describe('expected responses', () => {
    test('Should redirect to complete when successful', () => {
      // const promise = uploadDataController.handler(mockRequest, mockViewHandler)
      uploadDataController.handler(mockRequest, mockViewHandler)
      expect(mockViewHandler.redirect).toHaveBeenCalledWith('/upload/complete')
      // expect(promise).toBeDefined() : Fix me, I have left the bug in again!
    })

    test('Should redirect to error when no filename supplied', () => {
      const noFileNameRequest = {
        payload: {
          fileUpload: {
            hapi: { filename: '', headers: {} },
            pipe: mockRequest.payload.fileUpload.pipe,
            on: mockRequest.payload.fileUpload.on
          }
        }
      }
      uploadDataController.handler(noFileNameRequest, mockViewHandler)
      expect(mockViewHandler.redirect).toHaveBeenCalledWith('/upload/error')
    })
  })
})
