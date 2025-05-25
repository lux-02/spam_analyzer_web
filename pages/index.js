import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>DarkWinterLab</title>
        <meta name="description" content="DarkWinterLab" />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          body {
            background-color: #121212;
          }
        `}</style>
      </Head>

      <div className={styles.container}>
        {/* 메인 콘텐츠 */}
        <main className={styles.main}>
          {/* 메인 이미지 */}
          <div className={styles.imageContainer}>
            <Image
              src="/star.svg"
              alt="DarkWinterLab logo"
              width={300}
              height={300}
              priority
              className={`${styles.rotatingStar} w-full h-auto`}
            />
          </div>
          <div className={styles.logoContainer}>
            <Image
              src="/lux_logo_w.svg"
              alt="DarkWinterLab_logo"
              width={100}
              height={100}
              priority
              className={styles.logoImage}
            />
          </div>
          <div className={styles.imageContainer}>
            <Image
              src="/dwl_logo_w.svg"
              alt="DarkWinterLab_logo"
              width={300}
              height={300}
              priority
              className="w-full h-auto"
            />
          </div>

          <div className={styles.cardContainer}>
            {/* 네이버 서비스 카드 링크 */}
            <Link href="/naver" className={styles.card}>
              <h2>NAVER MAIL ANALYZER </h2>
              <p>네이버 메일의 스팸/피싱 분석 서비스를 제공합니다.</p>
            </Link>
            <Link href="https://reina-eng.vercel.app/" className={styles.card}>
              <h2>ENGLISH LEARNING</h2>
              <p>영어 학습을 위한 플랫폼을 제공합니다.</p>
            </Link>
            <Link
              href="https://reflector-one.vercel.app/"
              className={styles.card}
            >
              <h2>REFLECTOR</h2>
              <p>
                매일 새로운 질문으로 자신을 돌아보고 성장하는 자기 성찰
                플랫폼입니다.
              </p>
            </Link>
            <Link
              href="https://happy-news-phi.vercel.app/"
              className={styles.card}
            >
              <h2>HAPPY NEWS</h2>
              <p>
                세상에 희망을, 뉴스에 행복을 전하는 긍정 뉴스 필터링 검색
                서비스입니다.
              </p>
            </Link>
            <Link
              href="https://themepark00.vercel.app/"
              className={styles.card}
            >
              <h2>THEME PARK WAITING TIME</h2>
              <p>
                실시간으로 전세계 주요 놀이공원의 대기시간을 확인할 수 있습니다.
              </p>
            </Link>
            <Link href="https://shinto-map.vercel.app/" className={styles.card}>
              <h2>神社マップ</h2>
              <p>
                일본 신사 위치와 상세 정보를 제공하는 인터랙티브 웹
                서비스입니다.
              </p>
            </Link>
            <Link
              href="https://life-smart-meter.vercel.app/"
              className={styles.card}
            >
              <h2>Life Smart Meter</h2>
              <p>삶을 측정하는 인생 계량기 서비스입니다.</p>
            </Link>
            <Link href="/404" className={styles.card}>
              <h2>AI GEN Shader</h2>
              <p>AI를 이용한 GLSL Shader 생성 서비스를 제공합니다.</p>
            </Link>
            <Link href="/404" className={styles.card}>
              <h2>DARKWEB OSINT</h2>
              <p>딥다크웹 정보 수집 및 알림 시스템입니다.</p>
            </Link>
            <Link href="/404" className={styles.card}>
              <h2>✦ PROFILE</h2>
              <p>CERTIFICATE & AWARD & PROJECT</p>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
