import bcrypt from "bcryptjs";

export const hashPassword = (password) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPasswrd = bcrypt.hashSync(password, salt);
    return hashedPasswrd;
  } catch (err) {
    throw err;
  }
};

export const verifyPassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};
