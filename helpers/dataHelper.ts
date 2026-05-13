import { generateRandomString } from "./commonHelper";
import { RegisterFormData } from "../types/register.type";

const SPECIAL_TOKENS = {
  LONG_TEXT: "__LONG_TEXT__",
  LONG_TEXT_200: "__LONG_TEXT_200__",
  LONG_TEXT_201: "__LONG_TEXT_201__",
  LONG_EMAIL: "__LONG_EMAIL__",
  LONG_PASSWORD: "__LONG_PASSWORD__",
};

export const resolveSpecialTokens = <T extends Record<string, any>>(
  data: T
): T => {
  const resolved: Record<string, any> = { ...data };

  for (const key of Object.keys(resolved)) {
    const value = resolved[key];
    if (typeof value !== "string") continue;

    switch (value) {
      case SPECIAL_TOKENS.LONG_TEXT:
        resolved[key] = generateRandomString(256);
        break;

      case SPECIAL_TOKENS.LONG_TEXT_200:
        resolved[key] = generateRandomString(200);
        break;

      case SPECIAL_TOKENS.LONG_TEXT_201:
        resolved[key] = generateRandomString(201);
        break;

      case SPECIAL_TOKENS.LONG_EMAIL:
        resolved[key] = `${generateRandomString(200)}@gmail.com`;
        break;
    }
  }

  // Special-case: long password needs to update multiple fields if present
  for (const key of Object.keys(resolved)) {
    if (resolved[key] !== SPECIAL_TOKENS.LONG_PASSWORD) continue;

    const pwd = generateRandomString(65);
    resolved[key] = pwd;
    if ("password" in resolved) resolved.password = pwd;
    if ("confirmPassword" in resolved) resolved.confirmPassword = pwd;
  }

  return resolved as T;
};

// Backward-compatible API used by register spec
export const resolveSpecialValues = (data: RegisterFormData): RegisterFormData =>
  resolveSpecialTokens<RegisterFormData>(data);