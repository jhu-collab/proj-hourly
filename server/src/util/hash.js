import bcrypt from "bcrypt";

export const hash = async (data) => {
  const salt = await bcrypt.genSalt(10);
  const value = await bcrypt.hash(data, salt);
  return value;
};

export const compare = async (data, encrypted) => {
  const isMatch = await bcrypt.compare(data, encrypted);
  return isMatch;
};
