import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../site/index.html", import.meta.url), "utf8");

test("preserves the INSPECTOR interface and contact path", () => {
  assert.match(html, /INSPECTOR/);
  assert.match(html, /קבוצת פרוצס \| PROCES/);
  assert.match(html, /https:\/\/wa\.me\/message\/BGLY2ISQYD7DD1/);
  assert.match(html, /077-4243446/);
});

test("includes private authentication and request history surfaces", () => {
  assert.match(html, /id="authGate"/);
  assert.match(html, /id="googleSignIn"/);
  assert.match(html, /id="leadForm"/);
  assert.match(html, /id="requestsBody"/);
  assert.match(html, /<script type="module" src="\/app\.js"><\/script>/);
});

test("retains the required contractor-control sources", () => {
  assert.match(html, /nevo\.co\.il\/law_html\/law00\/117033\.htm#med9/);
  assert.match(html, /gov\.il\/he\/pages\/labor-rights-civil-liability/);
  assert.match(html, /gov\.il\/he\/pages\/employment-by-contractors/);
});
