export const endpoints = {
  login: "/api/Users/login",
  verifyLoginCode: "/api/Users/verifyLoginCode",
  register: "/api/Users/register",
  verifySignUpCode: "/api/Users/verifySignUpCode",
  createProfile: "/api/Users/createProfile",
  createReqClient: "/api/Users/createReqClient",
  getReqClient: "/api/Users/getReqClient",
  createAttachment: "/api/Attachment/createAttachment",
  getUserProfile: "/api/Users/getUserProfile",
} as const;
