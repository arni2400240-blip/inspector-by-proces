import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const authGate = document.getElementById("authGate");
const appShell = document.getElementById("appShell");
const authMessage = document.getElementById("authMessage");
const signInButton = document.getElementById("googleSignIn");
const signOutButton = document.getElementById("signOut");
const userLabel = document.getElementById("userLabel");
const leadForm = document.getElementById("leadForm");
const success = document.getElementById("success");
const requestsBody = document.getElementById("requestsBody");

let supabase = null;
let currentUser = null;

function showConfigurationError() {
  authMessage.textContent = "חיבור הענן עדיין לא הוגדר. יש להוסיף את משתני הסביבה של Supabase.";
  signInButton.disabled = true;
}

function setAuthenticated(user) {
  currentUser = user;
  authGate.hidden = true;
  appShell.hidden = false;
  userLabel.textContent = user.email || "משתמש מחובר";
  loadRequests();
}

function setAnonymous() {
  currentUser = null;
  appShell.hidden = true;
  authGate.hidden = false;
  requestsBody.innerHTML = "";
}

async function loadRequests() {
  if (!supabase || !currentUser) return;
  requestsBody.innerHTML = '<tr><td colspan="4">טוען...</td></tr>';
  const { data, error } = await supabase
    .from("inspection_requests")
    .select("id, company, city, service, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    requestsBody.innerHTML = '<tr><td colspan="4">לא ניתן לטעון את הפניות כרגע.</td></tr>';
    return;
  }

  if (!data.length) {
    requestsBody.innerHTML = '<tr><td colspan="4">עדיין לא נשמרו פניות.</td></tr>';
    return;
  }

  requestsBody.innerHTML = data.map((row) => `
    <tr>
      <td>${escapeHtml(row.company)}</td>
      <td>${escapeHtml(row.city)}</td>
      <td>${escapeHtml(row.service)}</td>
      <td>${new Intl.DateTimeFormat("he-IL").format(new Date(row.created_at))}</td>
    </tr>`).join("");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]);
}

if (!supabaseUrl || !supabaseKey) {
  showConfigurationError();
} else {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  const { data: { session } } = await supabase.auth.getSession();
  session?.user ? setAuthenticated(session.user) : setAnonymous();

  supabase.auth.onAuthStateChange((_event, nextSession) => {
    nextSession?.user ? setAuthenticated(nextSession.user) : setAnonymous();
  });
}

signInButton.addEventListener("click", async () => {
  if (!supabase) return;
  authMessage.textContent = "מעביר להתחברות מאובטחת באמצעות Google...";
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) authMessage.textContent = "ההתחברות נכשלה. יש לבדוק את הגדרות Google ו-Supabase.";
});

signOutButton.addEventListener("click", async () => {
  if (supabase) await supabase.auth.signOut();
});

leadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabase || !currentUser) return setAnonymous();

  const value = (id) => document.getElementById(id).value.trim();
  const requestedChecks = [...document.querySelectorAll('input[name="requested_checks"]:checked')]
    .map((input) => input.value);
  const payload = {
    user_id: currentUser.id,
    name: value("name"),
    company: value("company"),
    phone: value("phone"),
    city: value("city"),
    site_type: value("siteType"),
    scope: value("scope"),
    service: value("service"),
    details: value("details") || null,
    requested_checks: requestedChecks,
  };

  const submitButton = leadForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "שומר...";
  success.style.display = "none";

  const { error } = await supabase.from("inspection_requests").insert(payload);
  submitButton.disabled = false;
  submitButton.textContent = "שמרו והכינו פנייה ל-WhatsApp";

  if (error) {
    success.textContent = "השמירה נכשלה. יש לנסות שוב.";
    success.style.display = "block";
    return;
  }

  const text = [
    "שלום INSPECTOR, אני מבקש/ת בדיקה ראשונית ללא עלות.",
    `שם: ${payload.name}`,
    `חברה: ${payload.company}`,
    `טלפון: ${payload.phone}`,
    `יישוב/אזור: ${payload.city}`,
    `סוג אתר: ${payload.site_type}`,
    `היקף: ${payload.scope}`,
    `נושא הבדיקה: ${payload.service}`,
    `הערה: ${payload.details || "לא נמסרה"}`,
  ].join("\n");

  success.textContent = "הפנייה נשמרה בענן. חלון WhatsApp נפתח לשליחה.";
  success.style.display = "block";
  leadForm.reset();
  await loadRequests();
  window.open(`https://wa.me/message/BGLY2ISQYD7DD1?text=${encodeURIComponent(text)}`, "_blank", "noopener");
});
