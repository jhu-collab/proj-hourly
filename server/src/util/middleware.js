export const checkToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    // check the token or attach it to the request object!
    req.token = token;
  }
  next();
};

export const globalErrorHandler = (err, req, res, next) => {
  if (err) {
    // console.log(err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Internal server error!" });
  }
  next();
};
