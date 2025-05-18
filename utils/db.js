import mongoose from "mongoose";

// MongoDB 연결 상태를 추적하는 변수
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/spam_analyzer";

// 캐시된 연결을 저장하는 객체
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// MongoDB 연결 함수
export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("MongoDB 연결 성공");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB 연결 실패:", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// 모델 스키마 정의
const AnalysisResultSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
    from: { type: String },
    to: { type: String },
    subject: { type: String },
    spf: { type: String },
    dkim: { type: String },
    dmarc: { type: String },
    receivedPaths: [String],
    receivedDetails: [Object],
    links: [String],
    ipAddresses: [String],
    domains: [String],
    hostNames: [String],
    body: { type: String },
    beacons: [String],
    attachments: [Object],
    llmAnalysis: {
      category: String,
      confidence: String,
      reason: String,
      riskScore: Number,
      model_used: String,
      analysisMessage: String,
    },
    risk: {
      score: Number,
      factors: [String],
      level: String,
    },
    rawData: { type: String },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// 모델 생성 (이미 존재하는 경우 재사용)
export const AnalysisResult =
  mongoose.models.AnalysisResult ||
  mongoose.model("AnalysisResult", AnalysisResultSchema);
