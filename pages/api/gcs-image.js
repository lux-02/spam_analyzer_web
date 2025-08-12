import { Storage } from "@google-cloud/storage";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: "Path parameter is required" });
  }

  try {
    // GCP Storage 설정
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
        ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
        : undefined,
    });

    const bucket = storage.bucket(
      process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "designarc"
    );
    const file = bucket.file(path);

    // 파일 존재 여부 확인
    const [exists] = await file.exists();
    if (!exists) {
      return createFallbackImage(res, "File not found");
    }

    // 파일 다운로드
    const [fileBuffer] = await file.download();

    // Content-Type 추론
    const contentType = getContentType(path);

    // CORS 헤더 설정
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // 24시간 캐시

    // 이미지 데이터 반환
    res.status(200).send(fileBuffer);
  } catch (error) {
    console.error("GCS 이미지 로드 오류:", error.message);
    return createFallbackImage(res, "GCS access error");
  }
}

// Content-Type 추론 함수
function getContentType(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const mimeTypes = {
    // 이미지 타입
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    // 오디오 타입
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
    aac: "audio/aac",
    ogg: "audio/ogg",
    flac: "audio/flac",
    // 비디오 타입
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

// 대체 이미지 생성 함수
function createFallbackImage(res, errorMessage) {
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E8B059;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#D4A043;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#grad1)" />
      
      <text x="50%" y="45%" 
            text-anchor="middle" 
            dominant-baseline="middle" 
            font-family="Arial, sans-serif" 
            font-size="36" 
            font-weight="bold" 
            fill="white">
        Portfolio Image
      </text>
      
      <text x="50%" y="60%" 
            text-anchor="middle" 
            dominant-baseline="middle" 
            font-family="Arial, sans-serif" 
            font-size="18" 
            fill="rgba(255,255,255,0.8)">
        ${errorMessage}
      </text>
    </svg>
  `;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=300"); // 5분 캐시
  res.status(200).send(svg);
}
