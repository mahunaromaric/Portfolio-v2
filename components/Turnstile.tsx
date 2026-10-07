"use client";

import { useEffect, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
    __turnstileLoaded?: boolean;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

/** Widget Cloudflare Turnstile. Ne rend rien si aucune clé publique configurée (dev). */
export function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const uid = useId();

  useEffect(() => {
    onTokenRef.current = onToken;
  });

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => onTokenRef.current(null),
      });
    };

    if (window.turnstile) {
      render();
    } else if (!window.__turnstileLoaded) {
      window.__turnstileLoaded = true;
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = render;
      document.head.appendChild(s);
    } else {
      const timer = setInterval(() => {
        if (window.turnstile) {
          clearInterval(timer);
          render();
        }
      }, 200);
      return () => clearInterval(timer);
    }
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* ignore */
        }
        widgetId.current = null;
      }
    };
  }, [siteKey, uid]);

  if (!siteKey) return null;
  return <div ref={containerRef} className="my-2" />;
}
