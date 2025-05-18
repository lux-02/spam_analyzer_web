import React, { createContext, useContext, useEffect, useState } from "react";

// 테마 컨텍스트 생성
const ThemeContext = createContext();

// 테마 제공자 컴포넌트
export const ThemeProvider = ({ children }) => {
  // 테마 상태 ('light' 또는 'dark')
  const [theme, setTheme] = useState("light"); // 기본값을 'light'로 설정

  // 브라우저에서 실행될 때만 localStorage 확인
  useEffect(() => {
    // 저장된 테마가 있으면 사용, 없으면 light 사용
    const savedTheme = localStorage.getItem("theme");
    // 저장된 테마가 없으면 기본값으로 light 저장
    if (!savedTheme) {
      localStorage.setItem("theme", "light");
    }

    const themeToUse = savedTheme || "light";
    setTheme(themeToUse);

    if (themeToUse === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // 테마 전환 함수
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 테마 사용을 위한 커스텀 훅
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
