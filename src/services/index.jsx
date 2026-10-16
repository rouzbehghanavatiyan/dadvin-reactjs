import { postAuth } from "../services/masterService";
import {
  createRegisterPayload,
  createVerifyPayload,
  createLoginPayload,
  createLoginVerifyPayload,
} from "../utils/authContract";
import { readAuthResult } from "../utils/authResponse";

// Paths and request field names verified against Swagger on 2026-10-15.
export const login = async (values, options) =>
  readAuthResult(
    await postAuth("/api/Users/login", createLoginPayload(values), options),
  );
export const verifyLoginCode = async (values, options) =>
  readAuthResult(
    await postAuth(
      "/api/Users/verifyLoginCode",
      createLoginVerifyPayload(values),
      options,
    ),
  );
export const registerAccount = async (values) =>
  readAuthResult(
    await postAuth("/api/Users/register", createRegisterPayload(values)),
  );
export const verifyRegistrationCode = async (values) =>
  readAuthResult(
    await postAuth("/api/Users/verifyLoginCode", createVerifyPayload(values)),
  );
