class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export default ApiError;
