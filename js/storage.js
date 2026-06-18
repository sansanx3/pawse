// All localStorage keys are prefixed with 'pawse:' to avoid collisions.
const PREFIX = 'pawse:';

export function storeSave(key, value) {
  localStorage.setItem(PREFIX + key, value);
}

export function storeGet(key) {
  return localStorage.getItem(PREFIX + key);
}

export function storeDelete(key) {
  localStorage.removeItem(PREFIX + key);
}

export function storeListKeys(subPrefix) {
  const full = PREFIX + subPrefix;
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(full)) keys.push(k.slice(PREFIX.length));
  }
  return keys;
}
