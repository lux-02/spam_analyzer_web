import { Storage } from "@google-cloud/storage";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

// GCP Storage 설정
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}"
  ),
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

// Multer 설정 (메모리 저장)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB 제한
  },
});

// API 설정
export const config = {
  api: {
    bodyParser: false,
  },
};

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Multer 미들웨어 실행
    await runMiddleware(req, res, upload.single("file"));

    if (!req.file) {
      return res.status(400).json({ error: "파일이 업로드되지 않았습니다." });
    }

    // 파일 확장자 추출
    const fileExtension = req.file.originalname.split(".").pop();
    const fileName = `portfolio/${uuidv4()}.${fileExtension}`;

    // GCS에 파일 업로드
    const file = bucket.file(fileName);
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
        cacheControl: "public, max-age=31536000", // 1년 캐시
      },
    });

    return new Promise((resolve, reject) => {
      stream.on("error", (error) => {
        console.error("업로드 에러:", error);
        res.status(500).json({ error: "파일 업로드에 실패했습니다." });
        reject(error);
      });

      stream.on("finish", async () => {
        try {
          // Uniform bucket-level access가 활성화된 경우 makePublic() 생략
          // 버킷이 이미 공개로 설정되어 있어야 함

          // 공개 URL 생성
          const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${fileName}`;

          res.status(200).json({
            url: publicUrl,
            fileName: req.file.originalname,
            size: req.file.size,
            contentType: req.file.mimetype,
          });
          resolve();
        } catch (error) {
          console.error("파일 업로드 완료 에러:", error);
          res
            .status(500)
            .json({ error: "파일 업로드 완료 처리에 실패했습니다." });
          reject(error);
        }
      });

      stream.end(req.file.buffer);
    });
  } catch (error) {
    console.error("API 에러:", error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
}
