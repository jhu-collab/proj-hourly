import jwt from "jsonwebtoken";

export const createToken = async (user, expiration, callback) => {
  const payload = {
    user: {
      id: user.id.toString(),
    },
  };
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: expiration || "20d",
    },
    (err, token) => callback(err, token)
  );
};

export const verifyToken = async (token, callback) =>
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    callback(error, decoded);
  });
