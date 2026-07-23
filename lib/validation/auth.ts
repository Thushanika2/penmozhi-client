import { z } from "zod"

type Translate = (key: string) => string

export function emailField(t: Translate) {
  return z
    .string()
    .trim()
    .min(1, t("auth.validation.emailRequired"))
    .email(t("auth.validation.emailInvalid"))
}

export function fullNameField(t: Translate) {
  return z
    .string()
    .trim()
    .min(2, t("auth.validation.fullNameRequired"))
    .max(255, t("auth.validation.fullNameMax"))
}

export function passwordField(t: Translate) {
  return z
    .string()
    .min(1, t("auth.validation.passwordRequired"))
    .min(6, t("auth.validation.passwordMin"))
    .max(128, t("auth.validation.passwordMax"))
}

export function loginPasswordField(t: Translate) {
  return z.string().min(1, t("auth.validation.passwordRequired"))
}

export function resetTokenField(t: Translate) {
  return z.string().trim().min(10, t("auth.validation.tokenRequired"))
}
