class AppError extends Error {
    constructor() {
        super()
    }
    createError( msg, statuscode, statustext) {
          this.msg = msg;
        this.statuscode = statuscode;
        this.statustext = statustext;
      return this
    }
}

module.exports = new AppError()