export const endpoints = {
  login: "/api/Users/login",
  verifyLoginCode: "/api/Users/verifyLoginCode",
  register: "/api/Users/register",
  verifySignUpCode: "/api/Users/verifySignUpCode",
  createProfile: "/api/Users/createProfile",
  createAttachment: "/api/Attachment/createAttachment",
  getUserProfile: "/api/Users/getUserProfile",
} as const;
