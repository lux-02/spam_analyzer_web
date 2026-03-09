import React from "react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`${nextTheme} mode로 전환`}
      aria-pressed={theme === "dark"}
      className={`p-2 rounded-lg bg-gray-100 dark:bg-box-light hover:bg-gray-200 dark:hover:bg-box transition-colors duration-200 ${className}`}
      title={nextTheme === "dark" ? "다크 모드로 전환" : "라이트 모드로 전환"}
    >
      <div className="relative">
        {/* 태양 아이콘 (라이트 모드 활성화 상태) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-5 h-5 text-amber-600 dark:text-gray-400 transition-opacity duration-300 ${
            theme === "light" ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>

        {/* 달 아이콘 (다크 모드 활성화 상태) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-5 h-5 text-gray-400 dark:text-blue-300 transition-opacity duration-300 ${
            theme === "dark" ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      </div>
    </button>
  );
};

export default ThemeToggle;
