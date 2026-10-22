const TOKEN_KEY = "booktheslot_token";
const AUTH_CHANGE_EVENT = "booktheslot:auth-change";

export function getAuthToken() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function saveAuthToken(token) {
  if (typeof window === "undefined" || !token) {
    throw new Error("Your sign-in could not be saved in this browser.");
  }
  window.localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChange();
}

export function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // The in-memory session still clears for this page load.
  }
  notifyAuthChange();
}

export const authChangeEvent = AUTH_CHANGE_EVENT;
