const errorHandle = (error, req, res, next) => {
    console.log(error)
    let title   = 'internal server error'
    let status  = 'fail'
    let code    = 505
    let message = 'generic error message'
    if (error.name === 'UnauthorizedError') {

        title   = 'unauthorized user'
        status  = 'fail',
        code    = 404
        message = 'missing bearer token'

    } else if (error === 'ValidationError') {

        title   = 'validation Error'
        status  = 'fail'
        code    = 418
        message = 'The server refuses the attempt to brew coffee with a teapot'
    } else if (error === 'DuplicateError') {
        title   = 'Duplicate Error'
        status  = 'fail'
        code    = 400
        message = 'entry already exists'
    } else if (error === 'MissingFields') {
        title   = 'Missing Fields'
        status  = 'fail',
        code    = 400
        message = 'you are missing required fields'
    } else if (error === 'NumVerifyError') {
        title   = 'Verification Failed'
        status  = 'fail'
        code    = 400
        message = 'number verification failed'
    } else if (error === 'SMSFail') {
        title   = 'Message not sent'
        status  = 'fail'
        code    = 400
        message = 'check number and try again'
    } else if (error === 'EmailFail') {
        title   = 'Message not sent'
        status  = 'fail'
        code    = 400
        message = 'check mail and try again'
    } else if (error === 'NotFound') {
        title   = 'Resource not found'
        status  = 'fail'
        code    = 404
        message = 'Resource does not exist'
    } else if (error === 'UpdateFail' ) {
        title   = 'Failed to update resource'
        status  = 'fail',
        code    = 304,
        message = 'update failure'
    }

    const errorResponse = {
          title: title ? title : error.title,
          status: status ? status : error.status,
          code: code? code: error.code,
          message: message ? message : error.message,
          timestamp: new Date().toISOString(),
      }

      return res.status(code).json(errorResponse)
}

module.exports = errorHandle