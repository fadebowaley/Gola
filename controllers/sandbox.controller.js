const vm = require("vm");
const util = require("util");

const MAX_CODE_LENGTH = 8000;
const CODE_TIMEOUT_MS = 1500;
const MAX_RESPONSE_BODY_LENGTH = 100000;
const DEFAULT_REQUEST_TIMEOUT_MS = 5000;
const MAX_REQUEST_TIMEOUT_MS = 10000;
const MIN_REQUEST_TIMEOUT_MS = 500;
const ALLOWED_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
const ALLOW_PRIVATE_API_SANDBOX = process.env.ALLOW_PRIVATE_API_SANDBOX === "true";

const FORBIDDEN_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "accept-encoding",
]);

const badRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const formatValue = (value) => {
  if (typeof value === "string") {
    return value;
  }

  return util.inspect(value, {
    depth: 4,
    maxArrayLength: 60,
    breakLength: 90,
    compact: true,
  });
};

const renderLab = (req, res) => {
  return res.render("pages/lab", {
    user: req.user,
    lmsPageTitle: "Code Lab",
    lmsActive: "lab",
  });
};

const renderApiSandbox = (req, res) => {
  return res.render("pages/api-sandbox", {
    user: req.user,
    lmsPageTitle: "API Sandbox",
    lmsActive: "api-sandbox",
  });
};

const runCode = async (req, res) => {
  const language = String(req.body?.language || "javascript")
    .trim()
    .toLowerCase();
  const code = String(req.body?.code || "");

  if (language !== "javascript") {
    return res.status(400).json({
      success: false,
      error: "Only JavaScript is supported in this lab right now.",
    });
  }

  if (!code.trim()) {
    return res.status(400).json({
      success: false,
      error: "Code input is required.",
    });
  }

  if (code.length > MAX_CODE_LENGTH) {
    return res.status(400).json({
      success: false,
      error: `Code exceeds the ${MAX_CODE_LENGTH} character limit.`,
    });
  }

  const logs = [];
  const consoleProxy = {
    log: (...args) => logs.push(args.map(formatValue).join(" ")),
    info: (...args) => logs.push(args.map(formatValue).join(" ")),
    warn: (...args) => logs.push(args.map(formatValue).join(" ")),
    error: (...args) => logs.push(args.map(formatValue).join(" ")),
  };

  const sandbox = {
    console: consoleProxy,
    Math,
    Date,
    JSON,
    Number,
    String,
    Boolean,
    Array,
    Object,
    RegExp,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    BigInt,
    process: undefined,
    require: undefined,
    module: undefined,
    global: undefined,
    globalThis: undefined,
  };

  const context = vm.createContext(sandbox, {
    name: "student-lab",
    codeGeneration: { strings: false, wasm: false },
  });

  try {
    const script = new vm.Script(code, { filename: "student-lab.js" });
    const executionResult = script.runInContext(context, {
      timeout: CODE_TIMEOUT_MS,
      displayErrors: false,
    });
    const isPromiseLike =
      executionResult && typeof executionResult === "object" && typeof executionResult.then === "function";

    if (isPromiseLike) {
      return res.status(400).json({
        success: false,
        logs,
        error: "Async code is not supported in this lab yet. Use synchronous JavaScript only.",
      });
    }

    return res.status(200).json({
      success: true,
      logs,
      result: formatValue(executionResult),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      logs,
      error: error?.message || "Code execution failed.",
    });
  }
};

const isPrivateHostname = (hostname) => {
  const normalized = String(hostname || "").toLowerCase();
  if (!normalized) {
    return true;
  }

  if (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized === "0.0.0.0" ||
    normalized === "host.docker.internal" ||
    normalized.endsWith(".local")
  ) {
    return true;
  }

  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(normalized)) {
    return false;
  }

  const octets = normalized.split(".").map((part) => Number(part));
  if (octets.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return false;
  }

  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
};

const parseHeaders = (input) => {
  if (input == null || input === "") {
    return {};
  }

  if (typeof input === "object" && !Array.isArray(input)) {
    return input;
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      return {};
    }

    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw badRequest("Headers must be a valid JSON object.");
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw badRequest("Headers must be a valid JSON object.");
    }

    return parsed;
  }

  throw badRequest("Headers must be an object or JSON string.");
};

const normalizeHeaders = (rawHeaders) => {
  const headers = {};
  for (const [key, value] of Object.entries(rawHeaders)) {
    const normalizedKey = String(key || "").trim();
    if (!normalizedKey) {
      continue;
    }

    if (FORBIDDEN_REQUEST_HEADERS.has(normalizedKey.toLowerCase())) {
      continue;
    }

    headers[normalizedKey] = String(value ?? "");
  }

  return headers;
};

const resolveTargetUrl = (rawUrl) => {
  const value = String(rawUrl || "").trim();
  if (!value) {
    throw badRequest("Request URL is required.");
  }

  if (value.startsWith("/")) {
    const fallbackBase = `http://127.0.0.1:${process.env.PORT || 3000}`;
    const appBaseUrl = process.env.APP_BASE_URL || fallbackBase;
    return {
      target: new URL(value, appBaseUrl),
      isInternalRelative: true,
    };
  }

  let target;
  try {
    target = new URL(value);
  } catch {
    throw badRequest("URL must start with http://, https://, or / for internal routes.");
  }

  return { target, isInternalRelative: false };
};

const normalizeTimeout = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_REQUEST_TIMEOUT_MS;
  }

  return Math.max(
    MIN_REQUEST_TIMEOUT_MS,
    Math.min(MAX_REQUEST_TIMEOUT_MS, Math.floor(parsed))
  );
};

const getHeaderValue = (headers, key) => {
  const target = String(key).toLowerCase();
  const entry = Object.entries(headers).find(
    ([headerKey]) => String(headerKey).toLowerCase() === target
  );
  return entry ? String(entry[1]) : "";
};

const runApiRequest = async (req, res) => {
  try {
    const rawMethod = String(req.body?.method || "GET")
      .trim()
      .toUpperCase();
    if (!ALLOWED_METHODS.has(rawMethod)) {
      throw badRequest("Unsupported HTTP method.");
    }

    const { target, isInternalRelative } = resolveTargetUrl(req.body?.url);
    if (!["http:", "https:"].includes(target.protocol)) {
      throw badRequest("Only http:// and https:// URLs are allowed.");
    }

    if (
      !isInternalRelative &&
      !ALLOW_PRIVATE_API_SANDBOX &&
      isPrivateHostname(target.hostname)
    ) {
      throw badRequest(
        "Private network hosts are blocked in API sandbox. Use a public endpoint or a relative internal path."
      );
    }

    const parsedHeaders = parseHeaders(req.body?.headers);
    const headers = normalizeHeaders(parsedHeaders);
    const timeoutMs = normalizeTimeout(req.body?.timeoutMs);

    let requestBody;
    if (!["GET", "HEAD"].includes(rawMethod)) {
      const rawBody = req.body?.body;

      if (typeof rawBody === "string") {
        const trimmed = rawBody.trim();
        if (trimmed) {
          const contentType = getHeaderValue(headers, "content-type").toLowerCase();
          if (contentType.includes("application/json")) {
            try {
              JSON.parse(trimmed);
            } catch {
              throw badRequest("Request body is not valid JSON for content-type application/json.");
            }
          }
          requestBody = trimmed;
        }
      } else if (rawBody != null) {
        requestBody = JSON.stringify(rawBody);
        if (!getHeaderValue(headers, "content-type")) {
          headers["Content-Type"] = "application/json";
        }
      }
    }

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = Date.now();

    let response;
    try {
      response = await fetch(target.toString(), {
        method: rawMethod,
        headers,
        body: requestBody,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutHandle);
    }

    const responseText = await response.text();
    const truncated = responseText.length > MAX_RESPONSE_BODY_LENGTH;
    const limitedBody = truncated
      ? responseText.slice(0, MAX_RESPONSE_BODY_LENGTH)
      : responseText;
    const responseHeaders = Object.fromEntries(response.headers.entries());
    const contentType = response.headers.get("content-type") || "";
    let body = limitedBody;

    if (contentType.toLowerCase().includes("application/json")) {
      try {
        body = JSON.parse(limitedBody);
      } catch {
        body = limitedBody;
      }
    }

    return res.status(200).json({
      success: true,
      request: {
        method: rawMethod,
        url: target.toString(),
        timeoutMs,
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        durationMs: Date.now() - startedAt,
        body,
        truncated,
      },
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      return res.status(504).json({
        success: false,
        error: "API request timed out.",
      });
    }

    if (error?.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(502).json({
      success: false,
      error: error?.message || "Unable to reach target API.",
    });
  }
};

module.exports = {
  renderLab,
  renderApiSandbox,
  runCode,
  runApiRequest,
};
