export function getFromLocalStorage<t>(key: string): t {
  const item = localStorage.getItem(key);
  const value =
    item &&
    item !== 'null' &&
    item !== 'undefined'
    ? JSON.parse(item)
    : undefined;
  return value as t;
}

export function saveToLocalStorage<t>(key: string, value: t) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function initLocalStorage<t>(key: string, value: t) {
  if (localStorage.getItem(key) !== null) return;
  localStorage.setItem(key, JSON.stringify(value));
}
