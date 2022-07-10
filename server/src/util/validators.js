import { z } from "zod";

export const emailSchema = z
  .string()
  .email({ message: "Invalid email address!" })
  .transform((str) => str.toLowerCase().trim());

export const requestIdSchema = z
  .number({
    required_error: "Request ID must be provided",
    invalid_type_error: "Request ID must be a number",
  })
  .positive({ message: "Request ID must be a positive integer" });
