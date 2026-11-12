"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "vythea:lang";
const EVENT = "vythea:lang";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function read() {
  try {
    return localStorage.getItem(KEY) || "en";
  } catch {
    return "en";
  }
}

/** The visitor's chosen language, shared by the header menu and the footer list. */
export function useLanguage(): [string, (code: string) => void] {
  const lang = useSyncExternalStore(subscribe, read, () => "en");
  const set = useCallback((code: string) => {
    try {
      localStorage.setItem(KEY, code);
    } catch {
      /* private mode: keep it for this page only */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [lang, set];
}
