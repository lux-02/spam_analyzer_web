import Head from "next/head";
import StyleGuide from "../components/ui/StyleGuide";

export default function StyleGuidePage() {
  return (
    <>
      <Head>
        <title>스타일 가이드 - 스팸 메일 분석기</title>
        <meta
          name="description"
          content="스팸 메일 분석기의 스타일 가이드 페이지입니다."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StyleGuide />
    </>
  );
}
