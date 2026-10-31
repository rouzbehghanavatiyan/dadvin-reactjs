import type { InternalAxiosRequestConfig } from "axios";
import type { AuthFlowError } from "../src/types/domain";
import test from "node:test";
import { createServer } from "node:http";
import {
  createProfilePayload,
  createAttachmentPayload,
  createProfilePhotoMetadata,
} from "../src/utils/profileContract";
import {
  lawyerRequiredQuestions,
  lawyerQuestionRules,
} from "../src/utils/lawyerProfile";
import assert from "node:assert/strict";
import http from "../src/utils/axios";
import {
  registerAccount,
  verifyRegistrationCode,
  login,
  verifyLoginCode,
  createProfile,
  createAttachment,
  saveProfile,
  getUserProfile,
} from "../src/services";
import {
  createRegisterPayload,
  createVerifyPayload,
  createLoginPayload,
  createLoginVerifyPayload,
} from "../src/utils/authContract";
import {
  readAuthResult,
  readVerificationResult,
} from "../src/utils/authResponse";
import {
  requireOtpDispatch,
  beginVerifiedSession,
  getAccessToken,
  clearVerifiedSession,
} from "../src/utils/authSession";
import { getErrorMessage } from "../src/services/masterService";
import mainReducer, {
  setOtpSession,
  clearOtpSession,
} from "../src/hooks/slices/mainReducer";
import {
  validateProfilePhoto,
  MAX_PROFILE_PHOTO_SIZE,
} from "../src/utils/profilePhoto";

function memoryStorage(): Storage {
  const memory = new Map<string, string>();
  return {
    get length() {
      return memory.size;
    },
    clear() {
      memory.clear();
    },
    getItem(key: string) {
      return memory.has(key) ? (memory.get(key) ?? null) : null;
    },
    key(index: number) {
      return [...memory.keys()][index] ?? null;
    },
    removeItem(key: string) {
      memory.delete(key);
    },
    setItem(key: string, value: string) {
      memory.set(key, String(value));
    },
  };
}

for (const name of ["localStorage", "sessionStorage"] as const) {
  const current = globalThis[name] as Storage | undefined;
  if (!current || typeof current.getItem !== "function") {
    Object.defineProperty(globalThis, name, {
      value: memoryStorage(),
      configurable: true,
    });
  }
}

const fixture = {
  role: "client",
  name: " آزمایشی ",
  lastName: " دادوین ",
  phoneNumber: "۰۹۱۲۳۴۵۶۷۸۹",
  email: "",
  nationalCode: "۰۰۱۲۳۴۵۶۷۸",
  registrationPermit: "STALE-LAWYER-PERMIT",
  password: "must-not-send",
  terms: true,
};

test("real duplicate signup failure must not be mistaken for the outer success envelope", () => {
  const response = {
    code: 0,
    message: "عملیات با موفقیت انجام شد",
    data: {
      isSuccess: false,
      message: "این شماره موبایل قبلاً ثبت‌نام شده است. لطفاً وارد شوید.",
    },
  };
  assert.throws(
    () => readAuthResult(response),
    (error: unknown) => {
      const failure = error as AuthFlowError;
      assert.equal(failure.message, response.data.message);
      assert.equal(failure.requiresLogin, true);
      assert.equal(failure.requiresRegistration, false);
      return true;
    },
  );
  assert.throws(
    () =>
      readAuthResult({
        code: 0,
        data: { isSuccess: false, message: "خطای دیگری رخ داد" },
      }),
    (error: unknown) => (error as AuthFlowError).requiresLogin === false,
  );
});

test("lawyer mandatory answers reject blank, invalid choices and invalid experience", () => {
  for (const question of lawyerRequiredQuestions) {
    const rules = lawyerQuestionRules(question);
    assert.ok(rules.required);
    assert.notEqual(rules.validate(rules.setValueAs("   ")), true);
    if (question.options) {
      assert.equal(rules.validate(question.options[0]), true);
      assert.notEqual(rules.validate("unrecognized"), true);
    }
  }
  const experienceQuestion = lawyerRequiredQuestions.find(
    (question) => question.name === "experienceYears",
  );
  if (!experienceQuestion) throw new Error("سؤال سابقه پیدا نشد.");
  const experience = lawyerQuestionRules(experienceQuestion);
  assert.equal(experience.validate(experience.setValueAs("۰")), true);
  assert.equal(experience.validate(experience.setValueAs("۱۲")), true);
  for (const value of ["-1", "1.5", "81", "text"])
    assert.notEqual(experience.validate(value), true);
});

test("default Axios origin points directly to the published API", () => {
  assert.equal(http.defaults.baseURL, "http://171.22.25.222:9090/");
  assert.equal(
    http.getUri({ url: "/api/Users/login" }),
    "http://171.22.25.222:9090/api/Users/login",
  );
});

test("login rejects email and normalizes mobile without extra form fields", () => {
  assert.deepEqual(
    createLoginPayload({ mobile: " ۰۹۱۲۳۴۵۶۷۸۹ ", password: "not-used" }),
    { mobile: "09123456789" },
  );
  for (const mobile of ["", null, "name@example.com", "123"])
    assert.throws(() => createLoginPayload({ mobile }), /موبایل/);
  assert.deepEqual(
    createLoginVerifyPayload({ mobile: "۰۹۱۲۳۴۵۶۷۸۹", code: " ۰۰۱۲ " }),
    { mobile: "09123456789", code: "0012" },
  );
  assert.throws(
    () => createLoginVerifyPayload({ mobile: "09123456789", code: "abc" }),
    /کد/,
  );
});

test("OTP session starts empty and local logout clears the verified identity", () => {
  let state = mainReducer(undefined, { type: "init" });
  assert.equal(state.verifiedMobile, null);
  state = mainReducer(state, setOtpSession({ mobile: "09123456789" }));
  assert.equal(state.verifiedMobile, "09123456789");
  state = mainReducer(state, clearOtpSession());
  assert.equal(state.verifiedMobile, null);
});

test("national code is required before registration leaves the client", () => {
  for (const nationalCode of ["", null, "123", "abcdefghij"])
    assert.throws(
      () => createRegisterPayload({ ...fixture, nationalCode }),
      /کد ملی/,
    );
});

test("profile photo validation rejects unsupported, empty and oversized files", () => {
  assert.equal(
    validateProfilePhoto({ type: "image/png", size: MAX_PROFILE_PHOTO_SIZE }),
    null,
  );
  assert.ok(
    validateProfilePhoto({
      type: "image/png",
      size: MAX_PROFILE_PHOTO_SIZE + 1,
    }),
  );
  assert.ok(validateProfilePhoto({ type: "image/svg+xml", size: 100 }));
  assert.ok(validateProfilePhoto({ type: "image/jpeg", size: 0 }));
});

test("client requests send null permit and only the published DTO fields", () => {
  assert.deepEqual(createRegisterPayload(fixture), {
    registrationPermit: null,
    name: "آزمایشی",
    lastName: "دادوین",
    email: null,
    nationalCode: "0012345678",
    phoneNumber: "09123456789",
  });
});
test("lawyer permit survives unchanged in registration and OTP verification", () => {
  const lawyer = {
    ...fixture,
    role: "lawyer",
    registrationPermit: "  TEST-۱۲۳  ",
  };
  assert.equal(createRegisterPayload(lawyer).registrationPermit, "TEST-123");
  assert.deepEqual(createVerifyPayload({ ...lawyer, code: " ۰۰۱۲ " }), {
    mobile: "09123456789",
    code: "0012",
    firstName: "آزمایشی",
    lastName: "دادوین",
    email: null,
    nationalCode: "0012345678",
    registrationPermit: "TEST-123",
  });
});
test("client OTP always sends null even if old lawyer data remains in the form", () => {
  assert.deepEqual(createVerifyPayload({ ...fixture, code: "٠١٢٣" }), {
    mobile: "09123456789",
    code: "0123",
    firstName: "آزمایشی",
    lastName: "دادوین",
    email: null,
    nationalCode: "0012345678",
    registrationPermit: null,
  });
});
test("missing permit and unsupported roles cannot send a request", () => {
  assert.throws(
    () =>
      createRegisterPayload({
        ...fixture,
        role: "lawyer",
        registrationPermit: " ",
      }),
    /پروانه/,
  );
  assert.throws(
    () => createRegisterPayload({ ...fixture, role: "arbitrator" }),
    /پشتیبانی/,
  );
});
test("HTTP 200 is not treated as success without explicit API confirmation", () => {
  assert.throws(
    () =>
      readAuthResult({ code: 0, data: { isSuccess: false, message: "رد شد" } }),
    /رد شد/,
  );
  assert.throws(() => readAuthResult({ code: 1, data: { isSuccess: true } }));
  assert.throws(() => readAuthResult({ message: "OK" }));
  assert.equal(
    readAuthResult({ code: 0, data: { isSuccess: true, message: "ارسال شد" } })
      .message,
    "ارسال شد",
  );
});

test("updated backend success flag is supported without trusting outer success messages", () => {
  assert.throws(
    () =>
      readAuthResult({
        code: 0,
        message: "عملیات با موفقیت انجام شد",
        data: {
          code: 1,
          success: false,
          message: "کاربری با این شماره موبایل یافت نشد.",
          result: null,
        },
      }),
    /یافت نشد/,
  );
  const result = {
    code: 0,
    success: true,
    message: "آزمایش محلی",
    result: null,
  };
  assert.equal(readAuthResult({ code: 0, data: result }), result);
  assert.throws(() =>
    readAuthResult({ code: 0, data: { ...result, code: 1 } }),
  );
  assert.throws(() =>
    readAuthResult({ code: 0, data: { success: false, isSuccess: true } }),
  );
  assert.throws(() =>
    readAuthResult({ code: 0, data: { success: true, isSuccess: false } }),
  );
});

test("unknown phone offers signup only for the observed account-not-found error", () => {
  try {
    readAuthResult({
      code: 0,
      data: {
        code: 1,
        success: false,
        message: "کاربری با این شماره موبایل یافت نشد.",
      },
    });
    assert.fail("expected failure");
  } catch (error) {
    assert.equal((error as AuthFlowError).requiresRegistration, true);
  }
  try {
    readAuthResult({
      code: 0,
      data: { code: 1, success: false, message: "کد نادرست است" },
    });
    assert.fail("expected failure");
  } catch (error) {
    assert.equal((error as AuthFlowError).requiresRegistration, false);
  }
});

test("profile save uploads first, skips upload without photo and stops on upload failure", async () => {
  const previous = http.defaults.adapter;
  const requests: InternalAxiosRequestConfig[] = [];
  let uploadFailure = false;
  http.defaults.adapter = async (config) => {
    requests.push(config);
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      data: {
        code: 0,
        data: {
          success: !(uploadFailure && (config.url ?? "").includes("Attachment")),
          message: "local fixture",
          result: { fixtureId: 77 },
        },
      },
    };
  };
  const photo = new File(["fixture"], "fixture.png", { type: "image/png" });
  const options = {
    token: "local-fixture",
    photo,
    readAttachmentId: (upload: { result?: { fixtureId?: number } }) =>
      upload.result?.fixtureId,
  };
  try {
    await saveProfile(profileFixture, options);
    assert.deepEqual(
      requests.map((r) => r.url),
      ["/api/Attachment/createAttachment", "/api/Profile/createProfile"],
    );
    assert.equal(JSON.parse(requests[1].data).profileAttachmentId, 77);
    requests.length = 0;
    await saveProfile(profileFixture);
    assert.deepEqual(
      requests.map((r) => r.url),
      ["/api/Profile/createProfile"],
    );
    assert.equal(JSON.parse(requests[0].data).profileAttachmentId, null);
    requests.length = 0;
    uploadFailure = true;
    await assert.rejects(saveProfile(profileFixture, options));
    assert.deepEqual(
      requests.map((r) => r.url),
      ["/api/Attachment/createAttachment"],
    );
    requests.length = 0;
    uploadFailure = false;
    await assert.rejects(
      saveProfile(profileFixture, { photo: options.photo }),
    );
    assert.equal(requests.length, 1);
    requests.length = 0;
    await assert.rejects(
      saveProfile(profileFixture, { photo: options.photo }),
    );
    await assert.rejects(
      saveProfile({ ...profileFixture, mandatoryAnswers: [] }, options),
    );
    assert.equal(requests.length, 0);
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(
      saveProfile(profileFixture, {
        signal: controller.signal,
      }),
    );
    assert.equal(requests.length, 0);
  } finally {
    http.defaults.adapter = previous;
  }
});

test("a token returned before OTP cannot establish a verified session", () => {
  clearVerifiedSession();
  assert.throws(
    () =>
      requireOtpDispatch({
        success: true,
        result: { token: "local-fixture-token" },
      }),
    /پیش از تأیید/,
  );
  assert.equal(getAccessToken(), null);
  assert.throws(
    () => beginVerifiedSession({ success: true, result: null }, "09123456789"),
    /توکن/,
  );
  assert.throws(
    () =>
      beginVerifiedSession(
        { result: { token: "local-fixture-token", mobile: "09123456780" } },
        "09123456789",
      ),
    /مطابقت/,
  );
  assert.equal(getAccessToken(), null);
  beginVerifiedSession(
    { result: { token: "local-fixture-token", mobile: "09123456789" } },
    "09123456789",
  );
  assert.equal(getAccessToken(), "local-fixture-token");
  clearVerifiedSession();
  assert.equal(getAccessToken(), null);
});

test("actual flat verification response establishes session only through verification adapter", () => {
  const data = { token: "local-fixture-token", mobile: "09123456789" };
  assert.throws(() => readAuthResult({ code: 0, data }));
  assert.equal(readVerificationResult({ code: 0, data }), data);
  for (const response of [
    { code: 1, data },
    { code: 0, data: { ...data, success: false } },
    { code: 0, data: { ...data, token: "" } },
    { code: 0, data: null },
  ])
    assert.throws(() => readVerificationResult(response));
  beginVerifiedSession(readVerificationResult({ code: 0, data }), data.mobile);
  assert.equal(getAccessToken(), data.token);
  clearVerifiedSession();
});

// All IDs and scores below are local test fixtures, never the production question catalog.
const profileFixture = {
  mandatoryAnswers: Array.from({ length: 6 }, (_, index) => ({
    questionId: index + 1,
    selectedOptionId: 100 + index,
  })),
  optionalAnswers: null,
  score: 10,
};

test("profile-photo metadata uses pf, original filename and lowercase extension without inventing an attachment ID", () => {
  for (const [name, type, ext] of [
    ["portrait.JPG", "image/jpeg", "jpg"],
    ["portrait.jpeg", "image/jpeg", "jpeg"],
    ["عکس.PNG", "image/png", "png"],
    ["portrait.webp", "image/webp", "webp"],
  ]) {
    const file = new File(["fixture"], name, { type });
    assert.deepEqual(createProfilePhotoMetadata(file), {
      AttachmentType: "pf", FileName: name, Ext: ext,
    });
    assert.equal(createAttachmentPayload(file).has("AttachmentId"), false);
  }
  assert.throws(() => createProfilePhotoMetadata(
    new File(["fixture"], "portrait.txt", { type: "image/png" }),
  ), /پسوند/);
});

test("profile adapter rejects incomplete, duplicate and text answers before any request", () => {
  assert.equal(createProfilePayload(profileFixture).profileAttachmentId, null);
  assert.throws(() =>
    createProfilePayload({
      ...profileFixture,
      mandatoryAnswers: profileFixture.mandatoryAnswers.slice(1),
    }),
  );
  assert.throws(() =>
    createProfilePayload({
      ...profileFixture,
      optionalAnswers: [profileFixture.mandatoryAnswers[0]],
    }),
  );
  assert.throws(() =>
    createProfilePayload({ ...profileFixture, score: undefined }),
  );
  assert.throws(() =>
    createProfilePayload({
      ...profileFixture,
      mandatoryAnswers: profileFixture.mandatoryAnswers.map((answer) => ({
        ...answer,
        selectedOptionId: "حقوقی",
      })),
    }),
  );
  assert.deepEqual(
    Object.keys(
      createProfilePayload({
        ...profileFixture,
        mobile: "must-not-send",
        token: "must-not-send",
      }),
    ).sort(),
    ["mandatoryAnswers", "optionalAnswers", "profileAttachmentId", "score"],
  );
});

test("bearer token is attached only by the axios interceptor", async () => {
  clearVerifiedSession();
  const previousAdapter = http.defaults.adapter;
  const authorization: Array<string | undefined> = [];
  http.defaults.adapter = async (config) => {
    const header = config.headers?.get?.("Authorization");
    authorization.push(typeof header === "string" ? header : undefined);
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      data: { code: 0, data: { success: true, result: { firstName: "آزمایش" } } },
    };
  };
  try {
    await getUserProfile();
    beginVerifiedSession({ token: "shared-token" }, "09123456789");
    await getUserProfile();
    assert.deepEqual(authorization, [undefined, "Bearer shared-token"]);
    assert.equal(http.defaults.headers.common.Authorization, undefined);
  } finally {
    clearVerifiedSession();
    http.defaults.adapter = previousAdapter;
  }
});

test("real Axios transport sends binary FormFiles with boundary and scoped Bearer header", async () => {
  const received: Array<{
    url?: string;
    headers: import("node:http").IncomingHttpHeaders;
    body: string;
  }> = [];
  const server = createServer(async (request, response) => {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(chunk);
    received.push({
      url: request.url,
      headers: request.headers,
      body: Buffer.concat(chunks).toString(),
    });
    response.setHeader("Content-Type", "application/json");
    response.end(
      JSON.stringify({
        code: 0,
        data: { code: 0, success: true, result: null },
      }),
    );
  });
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });
  try {
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("پورت سرور آزمایشی مشخص نشد.");
    }
    const options: import("axios").AxiosRequestConfig = {
      baseURL: `http://127.0.0.1:${address.port}`,
      proxy: false,
    };
    const file = new File(["local-test-image-bytes"], "local-test.png", {
      type: "image/png",
    });
    const form = createAttachmentPayload(file);
    assert.deepEqual([...form.keys()], ["FormFiles", "AttachmentType", "FileName", "Ext"]);
    assert.equal(form.get("AttachmentType"), "pf");
    assert.equal(form.get("FileName"), "local-test.png");
    assert.equal(form.get("Ext"), "png");
    assert.equal(form.has("AttachmentId"), false);
    beginVerifiedSession({ token: "local-fixture-token" }, "09123456789");
    await createAttachment(file, {}, options);
    await createProfile(profileFixture, options);
    assert.equal(received[0].url, "/api/Attachment/createAttachment");
    assert.match(
      String(received[0]?.headers["content-type"] ?? ""),
      /^multipart\/form-data; boundary=/,
    );
    assert.match(
      received[0].body,
      /name="FormFiles"; filename="local-test.png"/,
    );
    assert.match(received[0].body, /local-test-image-bytes/);
    assert.equal(
      received[0].headers.authorization,
      "Bearer local-fixture-token",
    );
    assert.equal(received[1].url, "/api/Profile/createProfile");
    const profileBody = JSON.parse(received[1].body);
    assert.equal(profileBody.token, undefined);
    assert.equal(Object.hasOwn(profileBody, "profileAttachmentId"), false);
    assert.equal(http.defaults.headers.common.Authorization, undefined);
  } finally {
    clearVerifiedSession();
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }
});
test("backend lookup error is displayed instead of a false success", () => {
  const error = {
    isAxiosError: true,
    response: {
      status: 500,
      data: {
        code: 500,
        success: false,
        message: "کاربری با این شماره یافت نشد.",
        result: null,
      },
    },
  };
  assert.equal(getErrorMessage(error), "کاربری با این شماره یافت نشد.");
});
test("both services use the global Axios instance and the exact Swagger paths", async () => {
  const previousAdapter = http.defaults.adapter;
  const requests: Array<{ url?: string; method?: string; body: Record<string, unknown> }> = [];
  http.defaults.adapter = async (config) => {
    requests.push({
      url: config.url,
      method: config.method,
      body: JSON.parse(String(config.data)) as Record<string, unknown>,
    });
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      data: { code: 0, data: { isSuccess: true, message: "آزمایش محلی" } },
    };
  };
  try {
    await registerAccount(fixture);
    await verifyRegistrationCode({ ...fixture, code: "1234" });
    await login({
      mobile: fixture.phoneNumber,
      password: "must-not-send",
      rememberMe: true,
    });
    await verifyLoginCode({
      mobile: fixture.phoneNumber,
      code: "٠٠١٢",
      registrationPermit: "do-not-guess-role",
    });
    assert.deepEqual(
      requests.map(({ url, method }) => ({ url, method })),
      [
        { url: "/api/Users/register", method: "post" },
        { url: "/api/Users/verifySignUpCode", method: "post" },
        { url: "/api/Users/login", method: "post" },
        { url: "/api/Users/verifyLoginCode", method: "post" },
      ],
    );
    assert.equal(requests[0].body.registrationPermit, null);
    assert.deepEqual(Object.keys(requests[1].body).sort(), [
      "code",
      "email",
      "firstName",
      "lastName",
      "mobile",
      "nationalCode",
      "registrationPermit",
    ]);
    assert.deepEqual(requests[2].body, { mobile: "09123456789" });
    assert.deepEqual(requests[3].body, { mobile: "09123456789", code: "0012" });
  } finally {
    http.defaults.adapter = previousAdapter;
  }
});
