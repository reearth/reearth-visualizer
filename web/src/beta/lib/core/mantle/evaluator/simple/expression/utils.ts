const usableChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateRandomString = (len: number): string => {
  return Array.from(window.crypto.getRandomValues(new Uint8Array(len)))
    .map(n => usableChars[n % len])
    .join("")
    .toLowerCase();
};
