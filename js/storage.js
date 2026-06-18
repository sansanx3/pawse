// All localStorage keys are prefixed with 'pawse:' to avoid collisions.
const PREFIX = 'pawse:';

function storeSave(key, value) {
  localStorage.setItem(PREFIX + key, value);
}

function storeGet(key) {
  return localStorage.getItem(PREFIX + key);
}

function storeDelete(key) {
  localStorage.removeItem(PREFIX + key);
}

function storeListKeys(subPrefix) {
  const full = PREFIX + subPrefix;
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(full)) keys.push(k.slice(PREFIX.length));
  }
  return keys;
}
