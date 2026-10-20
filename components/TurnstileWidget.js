import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

let scriptPromise = null;

const loadTurnstile = () => {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Turnstile 스크립트를 불러오지 못했습니다"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
};

/**
 * 사이트 키가 있을 때만 Cloudflare Turnstile 을 그린다. 없으면 아무것도 그리지 않는다.
 * 토큰은 한 번만 쓸 수 있으므로 분석 요청 뒤에는 ref.reset() 으로 새 토큰을 받는다.
 */
const TurnstileWidget = forwardRef(function TurnstileWidget({ onToken, onLoadError }, ref) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onTokenRef = useRef(onToken);
  const onLoadErrorRef = useRef(onLoadError);
  onTokenRef.current = onToken;
  onLoadErrorRef.current = onLoadError;

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenRef.current?.(null);
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }));

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          language: "ko",
          theme: "auto",
          callback: (token) => onTokenRef.current?.(token),
          "expired-callback": () => onTokenRef.current?.(null),
          "error-callback": () => onTokenRef.current?.(null),
        });
      })
      .catch((error) => {
        console.error(error);
        // 광고 차단기·사내 방화벽이 스크립트를 막으면 확인 상자가 아예 뜨지 않는다
        if (!cancelled) onLoadErrorRef.current?.(error);
      });

    return () => {
      cancelled = true;
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className="min-h-[65px]" />;
});

export const isTurnstileEnabled = Boolean(SITE_KEY);

export default TurnstileWidget;
