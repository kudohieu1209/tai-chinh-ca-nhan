#!/usr/bin/env node
// FinTrack — local admin CLI for Firebase Auth user management.
// Runs ONLY on your machine using a service account key (never deployed, never committed).
// Usage: node users.mjs <command> [args]   (see printHelp() or admin/README.md)

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const HERE = dirname(fileURLToPath(import.meta.url));
const KEY_PATH = join(HERE, "serviceAccountKey.json");
const USERS_COLLECTION = "fintrackUsers";
const OWNER_EMAIL = "kudohieu1209@gmail.com";
const LIST_PAGE_SIZE = 1000;

function fail(message) {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

function info(message) {
  console.log(`  ✔ ${message}`);
}

// --- bootstrap ---------------------------------------------------------------

function initAdmin() {
  if (!existsSync(KEY_PATH)) {
    fail(
      `Missing service account key.\n` +
        `    Expected at: ${KEY_PATH}\n` +
        `    Download it from Firebase Console → Project settings → Service accounts →\n` +
        `    "Generate new private key", then save it as admin/serviceAccountKey.json.\n` +
        `    See admin/README.md for the full walkthrough.`
    );
  }
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(readFileSync(KEY_PATH, "utf8"));
  } catch (err) {
    fail(`Could not read service account key: ${err.message}`);
  }
  if (serviceAccount.project_id !== "taichinhhiewu") {
    fail(
      `Service account belongs to project "${serviceAccount.project_id}", expected "taichinhhiewu".\n` +
        `    Make sure you downloaded the key from the FinTrack Firebase project.`
    );
  }
  initializeApp({ credential: cert(serviceAccount) });
}

// --- helpers -----------------------------------------------------------------

async function resolveUser(auth, idOrEmail) {
  if (!idOrEmail) fail("Missing <uid|email> argument.");
  const value = idOrEmail.trim();
  try {
    return value.includes("@")
      ? await auth.getUserByEmail(value.toLowerCase())
      : await auth.getUser(value);
  } catch (err) {
    if (err.code === "auth/user-not-found") fail(`No user found for "${value}".`);
    throw err;
  }
}

function roleOf(user) {
  return user.customClaims?.role || (isOwner(user) ? "owner (by email)" : "—");
}

function isOwner(user) {
  return String(user.email || "").toLowerCase() === OWNER_EMAIL;
}

function guardOwner(user, action, force) {
  if (isOwner(user) && !force) {
    fail(
      `Refusing to ${action} the owner account (${OWNER_EMAIL}). ` +
        `This would lock you out. Re-run with --force if you really mean it.`
    );
  }
}

function pad(value, width) {
  const str = String(value ?? "");
  return str.length >= width ? str : str + " ".repeat(width - str.length);
}

function padStart(value, width) {
  const str = String(value ?? "");
  return str.length >= width ? str : " ".repeat(width - str.length) + str;
}

function money(amount) {
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount || 0)) + " đ";
}

function sumAmount(items, predicate) {
  if (!Array.isArray(items)) return 0;
  return items.filter(predicate).reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
}

// Mirrors the app's money math (index.html): balance = income − expense.
function summarize(data) {
  const txns = Array.isArray(data?.transactions) ? data.transactions : [];
  const debts = Array.isArray(data?.debts) ? data.debts : [];
  const goals = Array.isArray(data?.goals) ? data.goals : [];
  const income = sumAmount(txns, (t) => t.type === "income");
  const expense = sumAmount(txns, (t) => t.type === "expense");
  return {
    income,
    expense,
    balance: income - expense,
    owe: sumAmount(debts, (d) => d.type === "owe" && !d.settled),
    lend: sumAmount(debts, (d) => d.type === "lend" && !d.settled),
    goalSaved: goals.reduce((s, g) => s + (Number(g.current) || 0), 0),
    txCount: txns.length,
  };
}

// --- commands ----------------------------------------------------------------

async function cmdList(auth) {
  const db = getFirestore();
  const users = [];
  let pageToken;
  do {
    const res = await auth.listUsers(LIST_PAGE_SIZE, pageToken);
    users.push(...res.users);
    pageToken = res.pageToken;
  } while (pageToken);

  if (users.length === 0) {
    info("No users found.");
    return;
  }

  console.log(
    `\n  ${pad("EMAIL", 32)}${pad("ROLE", 18)}${pad("STATUS", 10)}${padStart("BALANCE", 18)}${padStart("TXNS", 7)}`
  );
  console.log("  " + "-".repeat(82));
  let grandTotal = 0;
  for (const u of users) {
    const docSnap = await db.collection(USERS_COLLECTION).doc(u.uid).get();
    const status = u.disabled ? "DISABLED" : "active";
    const s = docSnap.exists ? summarize(docSnap.data()) : null;
    const balanceCol = s ? money(s.balance) : "(no data)";
    const txCol = s ? String(s.txCount) : "—";
    if (s) grandTotal += s.balance;
    console.log(
      `  ${pad(u.email || "(no email)", 32)}${pad(roleOf(u), 18)}${pad(status, 10)}${padStart(balanceCol, 18)}${padStart(txCol, 7)}`
    );
  }
  console.log("  " + "-".repeat(82));
  console.log(`  ${pad("Total: " + users.length + " user(s)", 60)}${padStart(money(grandTotal), 18)}\n`);
}

async function cmdGet(auth, target) {
  const user = await resolveUser(auth, target);
  const db = getFirestore();
  const docSnap = await db.collection(USERS_COLLECTION).doc(user.uid).get();

  console.log(`\n  Email      : ${user.email || "(none)"}`);
  console.log(`  UID        : ${user.uid}`);
  console.log(`  Role       : ${roleOf(user)}`);
  console.log(`  Status     : ${user.disabled ? "DISABLED" : "active"}`);
  console.log(`  Verified   : ${user.emailVerified ? "yes" : "no"}`);
  console.log(`  Created    : ${user.metadata.creationTime}`);
  console.log(`  Last login : ${user.metadata.lastSignInTime || "never"}`);
  console.log(`  Providers  : ${user.providerData.map((p) => p.providerId).join(", ") || "—"}`);

  if (!docSnap.exists) {
    console.log(`  Firestore  : no data document\n`);
    return;
  }
  const data = docSnap.data();
  const count = (key) => (Array.isArray(data[key]) ? data[key].length : 0);
  const s = summarize(data);
  console.log(`  Records    : ${count("transactions")} txns · ${count("debts")} debts · ` +
    `${count("budgets")} budgets · ${count("goals")} goals · ${count("notes")} notes`);
  console.log(`\n  Tổng thu   : ${money(s.income)}`);
  console.log(`  Tổng chi   : ${money(s.expense)}`);
  console.log(`  Số dư      : ${money(s.balance)}`);
  console.log(`  Đang nợ    : ${money(s.owe)}   (mình nợ người khác)`);
  console.log(`  Cho vay    : ${money(s.lend)}   (người khác nợ mình)`);
  console.log(`  Đã để dành : ${money(s.goalSaved)}   (mục tiêu tiết kiệm)\n`);
}

async function cmdDisable(auth, target, force) {
  const user = await resolveUser(auth, target);
  guardOwner(user, "disable", force);
  await auth.updateUser(user.uid, { disabled: true });
  info(`Disabled ${user.email || user.uid}. They can no longer sign in.`);
}

async function cmdEnable(auth, target) {
  const user = await resolveUser(auth, target);
  await auth.updateUser(user.uid, { disabled: false });
  info(`Enabled ${user.email || user.uid}.`);
}

async function cmdDelete(auth, target, { force, withData }) {
  const user = await resolveUser(auth, target);
  guardOwner(user, "delete", force);
  await auth.deleteUser(user.uid);
  info(`Deleted Auth account ${user.email || user.uid}.`);
  if (withData) {
    await getFirestore().collection(USERS_COLLECTION).doc(user.uid).delete();
    info(`Deleted Firestore data document for ${user.uid}.`);
  } else {
    console.log(`    (Firestore data kept. Re-run with --with-data to remove it too.)`);
  }
}

async function cmdReset(auth, target) {
  const user = await resolveUser(auth, target);
  if (!user.email) fail("This account has no email — cannot generate a reset link.");
  const link = await auth.generatePasswordResetLink(user.email);
  console.log(`\n  Password reset link for ${user.email}:\n`);
  console.log(`  ${link}\n`);
  console.log(`  Send this link to the user. It expires after a short time.\n`);
}

async function cmdSetRole(auth, target, role) {
  if (!role) fail("Missing <role> argument (e.g. admin, user).");
  const user = await resolveUser(auth, target);
  const claims = { ...(user.customClaims || {}), role };
  await auth.setCustomUserClaims(user.uid, claims);
  info(`Set role "${role}" on ${user.email || user.uid}.`);
  console.log(`    (User must sign out and back in for the new role to take effect.)`);
}

async function cmdClearRole(auth, target) {
  const user = await resolveUser(auth, target);
  const claims = { ...(user.customClaims || {}) };
  delete claims.role;
  await auth.setCustomUserClaims(user.uid, claims);
  info(`Cleared role on ${user.email || user.uid}.`);
}

// --- arg parsing & dispatch --------------------------------------------------

function printHelp() {
  console.log(`
  FinTrack Admin — Firebase Auth user management (local only)

  Usage: node users.mjs <command> [args] [flags]

  Commands:
    list                         List every user (email, uid, role, status, data?)
    get <uid|email>              Show full details for one user
    disable <uid|email>          Block sign-in for an account
    enable  <uid|email>          Re-allow sign-in
    delete  <uid|email>          Delete the Auth account   (--with-data also drops Firestore data)
    reset   <uid|email>          Generate a password-reset link to send the user
    set-role <uid|email> <role>  Set a custom role claim (e.g. admin)
    clear-role <uid|email>       Remove the custom role claim

  Flags:
    --force        Allow acting on the owner account (${OWNER_EMAIL})
    --with-data    With "delete": also remove the user's Firestore document

  Examples:
    node users.mjs list
    node users.mjs get someone@example.com
    node users.mjs disable someone@example.com
    node users.mjs delete someone@example.com --with-data
    node users.mjs set-role someone@example.com admin
`);
}

async function main() {
  const argv = process.argv.slice(2);
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  const args = argv.filter((a) => !a.startsWith("--"));
  const [command, target, extra] = args;

  if (!command || command === "help" || flags.has("--help")) {
    printHelp();
    return;
  }

  initAdmin();
  const auth = getAuth();
  const force = flags.has("--force");

  switch (command) {
    case "list":
      return cmdList(auth);
    case "get":
      return cmdGet(auth, target);
    case "disable":
      return cmdDisable(auth, target, force);
    case "enable":
      return cmdEnable(auth, target);
    case "delete":
      return cmdDelete(auth, target, { force, withData: flags.has("--with-data") });
    case "reset":
      return cmdReset(auth, target);
    case "set-role":
      return cmdSetRole(auth, target, extra);
    case "clear-role":
      return cmdClearRole(auth, target);
    default:
      fail(`Unknown command "${command}". Run "node users.mjs help" for usage.`);
  }
}

main().catch((err) => fail(err.message || String(err)));
