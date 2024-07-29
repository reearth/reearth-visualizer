export const setLocalStorageData = (
  localStorageKey: string,
  storedData: Record<string, number | boolean>,
) => {
  if (!localStorageKey) return;

  localStorage.setItem(localStorageKey, JSON.stringify(storedData));
};
