import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

function readApiBaseUrl() {
  const envPath = path.resolve(process.cwd(), ".env");
  const fallback = "http://localhost:5000/api/v1";

  if (!fs.existsSync(envPath)) {
    return fallback;
  }

  const raw = fs.readFileSync(envPath, "utf8");
  const line = raw
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("VITE_API_BASE_URL="));

  if (!line) {
    return fallback;
  }

  const value = line.slice("VITE_API_BASE_URL=".length).trim();

  if (!value) {
    return fallback;
  }

  const withoutQuotes = value.replace(/^['\"]|['\"]$/g, "");
  const trimmed = withoutQuotes.replace(/\/+$/, "");
  const normalized = trimmed.replace(/\/api\/v1$/i, "");

  return `${normalized}/api/v1`;
}

async function registerFlowUser(apiBaseUrl) {
  const timestamp = Date.now();
  const email = `pw-flow-${timestamp}@example.com`;
  const password = "Password123!";

  const response = await fetch(`${apiBaseUrl}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `PW Flow ${timestamp}`,
      email,
      password,
    }),
  });

  const responseJson = await response.json().catch(() => null);

  if (!response.ok || responseJson?.success !== true) {
    throw new Error(
      `Register failed (${response.status}): ${JSON.stringify(responseJson)}`,
    );
  }

  return { email, password };
}

async function run() {
  const webBaseUrl = process.env.PW_WEB_BASE_URL || "http://localhost:5173";
  const apiBaseUrl = readApiBaseUrl();
  const { email, password } = await registerFlowUser(apiBaseUrl);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const urlTimeline = [];
  const apiEvents = [];
  const start = Date.now();

  function capture(label) {
    urlTimeline.push({
      tMs: Date.now() - start,
      label,
      url: page.url(),
    });
  }

  page.on("response", async (response) => {
    const url = response.url();

    if (!url.includes("/api/v1/")) {
      return;
    }

    if (
      !url.includes("/auth/login") &&
      !url.includes("/auth/me") &&
      !url.includes("/missions")
    ) {
      return;
    }

    let bodySnippet = null;

    try {
      const text = await response.text();
      bodySnippet = text.slice(0, 240);
    } catch {
      bodySnippet = null;
    }

    apiEvents.push({
      tMs: Date.now() - start,
      type: "response",
      status: response.status(),
      url,
      bodySnippet,
    });
  });

  page.on("requestfailed", (request) => {
    const url = request.url();

    if (!url.includes("/api/v1/")) {
      return;
    }

    apiEvents.push({
      tMs: Date.now() - start,
      type: "requestfailed",
      url,
      failure: request.failure()?.errorText ?? "unknown",
    });
  });

  try {
    await page.goto(`${webBaseUrl}/login`, { waitUntil: "domcontentloaded" });
    capture("opened-login");

    await page.fill("#login-email", email);
    await page.fill("#login-password", password);

    await page.click('button[type="submit"]');
    capture("submitted-login");

    let firstMissionsAt = null;
    let bouncedBackToLogin = false;

    for (let index = 0; index < 80; index += 1) {
      await page.waitForTimeout(150);
      const currentUrl = page.url();
      const previous = urlTimeline[urlTimeline.length - 1]?.url;

      if (currentUrl !== previous) {
        capture("url-changed");
      }

      const pathname = new URL(currentUrl).pathname;

      if (!firstMissionsAt && pathname === "/missions") {
        firstMissionsAt = Date.now() - start;
      }

      if (firstMissionsAt && pathname === "/login") {
        bouncedBackToLogin = true;
        break;
      }
    }

    const finalPath = new URL(page.url()).pathname;
    const visibleErrorText = await page
      .locator("p.text-sm.text-red-600")
      .innerText()
      .catch(() => "");
    const success = finalPath === "/missions" && !bouncedBackToLogin;

    console.log(
      JSON.stringify(
        {
          success,
          finalPath,
          firstMissionsAtMs: firstMissionsAt,
          bouncedBackToLogin,
          visibleErrorText,
          apiEvents,
          loginEmail: email,
          timeline: urlTimeline,
        },
        null,
        2,
      ),
    );

    if (!success) {
      process.exitCode = 1;
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
