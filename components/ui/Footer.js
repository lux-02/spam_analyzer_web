import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/Home.module.css";
import { useRouter } from "next/router";
import { useTheme } from "../../context/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <footer className="py-6 text-center text-sm text-text-light dark:text-gray-400">
      <div className={styles.logoContainer}>
        <Image
          className={styles.footerLogoImage}
          src={theme === "dark" ? "/dwl_logo_w.svg" : "/dwl_logo_b.svg"}
          alt="DarkWinterLab_logo"
          width={100}
          height={100}
          priority
          onClick={() => router.push("/")}
        />
      </div>
      <p className="mt-4 mb-2">
        © 2026 NAVER MAIL ANALYZER - 일반 분석 경로에서는 이메일 원문을 서버
        DB에 영구 저장하지 않습니다.
      </p>
    </footer>
  );
}
