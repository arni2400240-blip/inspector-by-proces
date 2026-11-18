import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../site/index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../site/app.js", import.meta.url), "utf8");
const migration = await readFile(new URL("../supabase/migrations/20261118_create_inspection_requests.sql", import.meta.url), "utf8");

test("does not contain Supabase secret keys", () => {
  assert.doesNotMatch(`${html}\n${app}`, /service_role|SUPABASE_SERVICE_ROLE_KEY/i);
});

test("uses Google as the only sign-in provider", () => {
  assert.match(app, /provider:\s*["']google["']/);
  assert.doesNotMatch(app, /signInWithPassword|signUp\s*\(/);
});

test("enables row-level security and user ownership policies", () => {
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /auth\.uid\(\).*user_id/i);
});
