import test from "node:test";
import assert from "node:assert/strict";
import http from "../src/utils/axios";
import {
  registerAccount,
  verifyRegistrationCode,
  login,
  verifyLoginCode,
} from "../src/services";
import {
  createRegisterPayload,
  createVerifyPayload,
  createLoginPayload,
  createLoginVerifyPayload,
} from "../src/utils/authContract";
import { readAuthResult } from "../src/utils/authResponse";
import { getErrorMessage } from "../src/masterService";
import mainReducer, {
  setOtpSession,
  clearOtpSession,
} from "../src/hooks/slices/mainReducer";
import {
  validateProfilePhoto,
  MAX_PROFILE_PHOTO_SIZE,
} from "../src/utils/profilePhoto";

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
  state = mainReducer(state, setOtpSession("09123456789"));
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
  const requests = [];
  http.defaults.adapter = async (config) => {
    requests.push({
      url: config.url,
      method: config.method,
      body: JSON.parse(config.data),
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
        { url: "/api/Users/verifyLoginCode", method: "post" },
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
