import { postAuth } from "../masterService";
import {
  createRegisterPayload,
  createVerifyPayload,
} from "../utils/authContract";
import { readAuthResult } from "../utils/authResponse";

const environment = import.meta.env || {};

// Request fields and response handling must be reconciled with the published Swagger contract.
export const login = (payload) =>
  postAuth(environment.VITE_AUTH_LOGIN_PATH, payload);
export const registerAccount = async (values) =>
  readAuthResult(
    await postAuth("/api/Users/register", createRegisterPayload(values)),
  );
export const verifyRegistrationCode = async (values) =>
  readAuthResult(
    await postAuth("/api/Users/verifyLoginCode", createVerifyPayload(values)),
  );
export const recoverPassword = (payload) =>
  postAuth(environment.VITE_AUTH_RECOVERY_PATH, payload);
