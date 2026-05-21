import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const HASH_ALGORITHM = "sha512";
const HASH_ITERATIONS = 120000;
const HASH_BYTES = 64;

export function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_BYTES, HASH_ALGORITHM).toString("hex");
  return `pbkdf2$${HASH_ALGORITHM}$${HASH_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) {
    return false;
  }

  const [scheme, algorithm, iterations, salt, expected] = storedHash.split("$");
  if (scheme !== "pbkdf2" || algorithm !== HASH_ALGORITHM || !iterations || !salt || !expected) {
    return false;
  }

  const actual = pbkdf2Sync(password, salt, Number(iterations), Buffer.from(expected, "hex").length, algorithm);
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export function createSessionToken() {
  return `sis_${randomBytes(32).toString("base64url")}`;
}

export function ensureRuntimeCredentials(state) {
  const credentials = {
    user_super_admin: "ChangeMe!2026",
    user_faculty_1: "Faculty!2026"
  };

  let changed = false;
  for (const user of state.users) {
    if (!user.passwordHash && credentials[user.id]) {
      user.passwordHash = hashPassword(credentials[user.id]);
      user.passwordChangedAt = new Date().toISOString();
      changed = true;
    }
  }

  return changed;
}

export function publicUser(user) {
  const { passwordHash, failedLoginCount, lockedUntil, ...safe } = user;
  return safe;
}
