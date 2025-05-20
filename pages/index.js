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
              src="/main.svg"
              alt="DarkWinterLab logo"
              width={324}
              height={411}
              priority
              className="w-full h-auto"
            />
          </div>

          {/* 네이버 서비스 카드 링크 */}
          <Link href="/naver" className={styles.card}>
            <h2>네이버 메일 분석기 &rarr;</h2>
            <p>
              네이버 메일의 원문 데이터를 붙여넣고 스팸/피싱 여부를
              분석해보세요.
            </p>
          </Link>
        </main>
      </div>
    </>
  );
}
