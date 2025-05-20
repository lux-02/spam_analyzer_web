import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "../../styles/Home.module.css";
import { useRouter } from "next/router";
export default function Footer() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  // 테마 상태 감지 함수
  useEffect(() => {
    // 초기 테마 상태 감지
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    // 테마 변경 감지를 위한 observer 설정
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDarkMode(document.documentElement.classList.contains("dark"));
        }
      });
    });

    // DOM 변경 감지 시작
    observer.observe(document.documentElement, { attributes: true });

    // 컴포넌트 언마운트 시 observer 해제
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="py-6 text-center text-sm text-text-light dark:text-gray-400">
      <p className="mb-2">
        © 2025 NAVER MAIL ANALYZER - 이메일 분석 데이터는 안전한 데이터베이스에
        저장됩니다.
      </p>

      <div className={styles.logoContainer}>
        <Image
          src={isDarkMode ? "/dwl_logo_w.svg" : "/dwl_logo_b.svg"}
          alt="DarkWinterLab_logo"
          width={100}
          height={100}
          priority
          className={styles.footerLogoImage}
          onClick={() => router.push("/")}
        />
      </div>
    </footer>
  );
}
