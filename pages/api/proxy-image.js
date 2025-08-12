import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  try {
    // 외부 이미지를 가져옴
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 15000, // 15초 타임아웃
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Fetch-Dest": "image",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // 리다이렉트도 허용
      },
    });

    // Content-Type 헤더 설정
    const contentType = response.headers["content-type"] || "image/jpeg";

    // CORS 헤더 설정
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // 24시간 캐시

    // 이미지 데이터 반환
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error("이미지 프록시 오류:", error.message);

    // 기본 이미지 생성 (1x1 투명 픽셀)
    const transparentPixel = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3b,
    ]);

    res.setHeader("Content-Type", "image/gif");
    res.status(200).send(transparentPixel);
  }
}
