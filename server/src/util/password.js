import bcrypt from "bcryptjs";
import { factory } from "./debug.js";
const debug = factory(import.meta.url);
export const hashPassword = (password) => {
  debug("hashPassword called!");
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPasswrd = bcrypt.hashSync(password, salt);
    debug("hashPassword done!");

    return hashedPasswrd;
  } catch (err) {
    debug("hashPassword error...");
    throw err;
  }
};

export const verifyPassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};