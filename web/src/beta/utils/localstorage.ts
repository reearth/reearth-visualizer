export const setLocalStorageData = (localStorageKey: string, storedData: any) => {
  if (!localStorageKey) return;

  localStorage.setItem(localStorageKey, JSON.stringify(storedData));
};
