import "@/styles/globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  // hydration 이슈 방지를 위한 처리
  useEffect(() => {
    // SSR과 CSR의 불일치를 방지하기 위해 클라이언트 사이드에서만 테마 처리
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
    // 테마가 저장되어 있지 않으면 기본값으로 light 저장
    if (!localStorage.getItem("theme")) {
      localStorage.setItem("theme", "light");
    }
  }, []);

  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
