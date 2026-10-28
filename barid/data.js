import { FIREBASE_CONFIG, OWNER_EMAIL } from "./config.js";

const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
const SALT = "barid-oday-awad-v1|";
export const isDemo = !FIREBASE_CONFIG;

let fs, db, authMod, auth;

export async function init() {
  if (isDemo) return;
  const app = await import(FB + "firebase-app.js");
  fs = await import(FB + "firebase-firestore.js");
  authMod = await import(FB + "firebase-auth.js");
  const a = app.initializeApp(FIREBASE_CONFIG);
  db = fs.getFirestore(a);
  auth = authMod.getAuth(a);
}

/* ---------- أدوات ---------- */
export function normalizeName(s) {
  return (s || "")
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
    .replace(/ؤ/g, "و").replace(/ئ/g, "ي")
    .replace(/[^ء-يa-zA-Z\s]/g, " ")
    .replace(/\s+/g, " ").trim()
    .replace(/(^|\s)(عبد|ابو)\s+/g, "$1$2")
    .split(" ").slice(0, 3).join(" ");
}
export function normalizePhone(p) {
  let d = (p || "").replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/\D/g, "");
  if (d.startsWith("00964")) d = d.slice(5); else if (d.startsWith("964")) d = d.slice(3);
  if (d.length === 10 && d.startsWith("7")) d = "0" + d;
  return d;
}
export const looksLikePhone = (s) => normalizePhone(s).length >= 10 && !/[\u0621-\u064A]/.test(s);

async function hash(raw) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
/** مفتاح البحث: إما رقم هاتف أو اسم ثلاثي */
export async function lookupKey(input) {
  return looksLikePhone(input) ? hash(SALT + "p|" + normalizePhone(input)) : hash(SALT + "n|" + normalizeName(input));
}
async function keysFor(l) {
  const k = [await lookupKey(l.citizenName)];
  if (normalizePhone(l.phone).length >= 10) k.push(await hash(SALT + "p|" + normalizePhone(l.phone)));
  return k;
}
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function publicSummary(l) {
  const stages = [...(l.stages || [])].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  return {
    number: l.number || "", subject: l.subject || "", date: l.date || "", type: l.type || "",
    destination: l.destination || "", expectedDate: l.expectedDate || "",
    status: l.status || "active",
    imageId: l.imageId || "", pages: l.pageCount || 0,
    stages: stages.map((s) => ({ title: s.title, location: s.location || "", date: s.date || "", note: s.note || "" })),
  };
}

/* ---------- وضع تجريبي (localStorage) ---------- */
const LS = "barid_demo_db";
function ld() { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } }
function sv(d) { try { localStorage.setItem(LS, JSON.stringify(d)); } catch {} }
function col(name) { const d = ld(); return d[name] || {}; }
function put(name, id, val) { const d = ld(); d[name] = d[name] || {}; if (val === null) delete d[name][id]; else d[name][id] = val; sv(d); }

/* ---------- الدخول ---------- */
export function onAuth(cb) {
  if (isDemo) { cb(sessionStorage.getItem("barid_demo_user") ? { email: "تجريبي" } : null); return; }
  authMod.onAuthStateChanged(auth, cb);
}
export async function login() {
  if (isDemo) { sessionStorage.setItem("barid_demo_user", "1"); location.reload(); return; }
  const p = new authMod.GoogleAuthProvider();
  p.setCustomParameters({ prompt: "select_account" });
  try { await authMod.signInWithPopup(auth, p); }
  catch (e) {
    if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"].includes(e.code)) await authMod.signInWithRedirect(auth, p);
    else throw e;
  }
}
export async function logout() {
  if (isDemo) { sessionStorage.removeItem("barid_demo_user"); location.reload(); return; }
  await authMod.signOut(auth);
}

/* ---------- الموظفون ---------- */
/** يرجع صلاحيات المستخدم {mail, acts, owner} أو null إذا غير مخوّل */
export async function getPerms(email) {
  if (isDemo) return { mail: true, acts: true, press: true, owner: true };
  email = (email || "").toLowerCase();
  if (email === OWNER_EMAIL) return { mail: true, acts: true, press: true, owner: true };
  try {
    const s = await fs.getDoc(fs.doc(db, "staff", email));
    if (!s.exists()) return null;
    const p = s.data().perms || {};
    return { mail: !!p.mail, acts: !!p.acts, press: !!p.press, owner: false };
  } catch { return null; }
}
export async function staffAll() {
  if (isDemo) return Object.values(col("staff"));
  const s = await fs.getDocs(fs.collection(db, "staff"));
  return s.docs.map((d) => ({ email: d.id, ...d.data() }));
}
export async function staffAdd(email, name, perms) {
  email = email.trim().toLowerCase();
  const v = { email, name: name || "", perms: { mail: !!perms?.mail, acts: !!perms?.acts, press: !!perms?.press }, addedAt: new Date().toISOString() };
  if (isDemo) return put("staff", email, v);
  await fs.setDoc(fs.doc(db, "staff", email), v);
}
export async function staffRemove(email) {
  if (isDemo) return put("staff", email, null);
  await fs.deleteDoc(fs.doc(db, "staff", email));
}

/* ---------- البحث العام ---------- */
export async function publicLookup(key) {
  if (isDemo) return col("public")[key] || null;
  const s = await fs.getDoc(fs.doc(db, "public", key));
  return s.exists() ? s.data() : null;
}

/* ---------- الكتب ---------- */
export async function lettersAll() {
  if (isDemo) return Object.values(col("letters"));
  const s = await fs.getDocs(fs.collection(db, "letters"));
  return s.docs.map((d) => ({ id: d.id, ...d.data() }));
}
async function rebuildPublic(key) {
  if (!key) return;
  let list;
  if (isDemo) list = Object.values(col("letters")).filter((l) => (l.keys || []).includes(key));
  else {
    const s = await fs.getDocs(fs.query(fs.collection(db, "letters"), fs.where("keys", "array-contains", key)));
    list = s.docs.map((d) => d.data());
  }
  list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const val = list.length ? { letters: list.map(publicSummary), updatedAt: new Date().toISOString() } : null;
  if (isDemo) return put("public", key, val);
  const ref = fs.doc(db, "public", key);
  val ? await fs.setDoc(ref, val) : await fs.deleteDoc(ref);
}
export async function letterSave(l, oldKeys = []) {
  l.keys = await keysFor(l);
  l.updatedAt = new Date().toISOString();
  l.id = l.id || uid();
  if (isDemo) put("letters", l.id, l);
  else await fs.setDoc(fs.doc(db, "letters", l.id), l);
  for (const k of new Set([...l.keys, ...oldKeys])) await rebuildPublic(k);
  return l;
}
export async function letterDelete(l) {
  if (isDemo) put("letters", l.id, null);
  else await fs.deleteDoc(fs.doc(db, "letters", l.id));
  if (l.imageId) await imageDelete(l.imageId);
  for (const k of l.keys || []) await rebuildPublic(k);
}

/* ---------- صورة الكتاب (مستند منفصل برمز عشوائي) ---------- */
export const randomId = () => [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, "0")).join("");
export async function imageGet(id) {
  if (isDemo) return col("images")[id] || null;
  const s = await fs.getDoc(fs.doc(db, "images", id));
  return s.exists() ? s.data() : null;
}
export async function imageSave(id, pages) {
  const val = { pages, updatedAt: new Date().toISOString() };
  if (JSON.stringify(val).length > 1000000) throw new Error("حجم الصور كبير، قلّل عدد الصفحات");
  if (isDemo) return put("images", id, val);
  await fs.setDoc(fs.doc(db, "images", id), val);
}
export async function imageDelete(id) {
  if (isDemo) return put("images", id, null);
  await fs.deleteDoc(fs.doc(db, "images", id));
}

/* ---------- المنشورات: النشاطات (activities) والتصريحات الصحفية (press) ---------- */
export async function postsAll(c) {
  let list;
  if (isDemo) list = Object.values(col(c));
  else { const s = await fs.getDocs(fs.collection(db, c)); list = s.docs.map((d) => ({ id: d.id, ...d.data() })); }
  return list.sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || "").localeCompare(a.createdAt || ""));
}
export async function postSave(c, a) {
  if (JSON.stringify(a).length > 1000000) throw new Error("حجم الصور كبير، قلّل عدد الصور");
  a.id = a.id || uid();
  if (isDemo) put(c, a.id, a);
  else await fs.setDoc(fs.doc(db, c, a.id), a);
}
export async function postDelete(c, a) {
  if (isDemo) put(c, a.id, null);
  else await fs.deleteDoc(fs.doc(db, c, a.id));
}
export const activitiesAll = () => postsAll("activities");

/* ---------- عرض ---------- */
export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("ar-IQ", { day: "numeric", month: "long", year: "numeric" });
}
export function daysBetween(a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 864e5); }
export const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function compressImage(file, max = 1100, q = 0.72) {
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
  const r = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas"); c.width = img.width * r; c.height = img.height * r;
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", q);
}
