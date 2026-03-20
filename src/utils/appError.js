class AppError extends Error {
  constructor(message, statusCode, actionType) {
    super(message);
    this.statusCode = statusCode;
    this.actionType = actionType; // Ví dụ: 'UNAUTHORIZED_ACCESS'
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
