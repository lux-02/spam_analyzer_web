/**
 * MongoDB 연결 및 작동 확인 스크립트
 *
 * 사용법: node scripts/db-check.js
 */

const mongoose = require("mongoose");

// MongoDB 연결 문자열
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/spam_analyzer";

async function checkDbConnection() {
  console.log("MongoDB 연결 확인 스크립트");
  console.log(`연결 문자열: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB 연결 성공!");

    // 연결 상태 확인
    const connectionState = mongoose.connection.readyState;
    console.log(`연결 상태: ${getConnectionStateName(connectionState)}`);

    // 연결된 데이터베이스 이름 출력
    const dbName = mongoose.connection.db.databaseName;
    console.log(`데이터베이스 이름: ${dbName}`);

    // 컬렉션 목록 출력
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log("\n📋 컬렉션 목록:");
    if (collections.length === 0) {
      console.log("  컬렉션이 없습니다.");
    } else {
      collections.forEach((collection) => {
        console.log(`  - ${collection.name}`);
      });
    }

    // 분석 결과 컬렉션 확인
    const analysisResultCollectionName = "analysisresults";
    const hasAnalysisCollection = collections.some(
      (c) => c.name === analysisResultCollectionName
    );

    if (hasAnalysisCollection) {
      console.log("\n📊 분석 결과 컬렉션 정보:");
      const count = await mongoose.connection.db
        .collection(analysisResultCollectionName)
        .countDocuments();
      console.log(`  문서 개수: ${count}`);

      if (count > 0) {
        const sample = await mongoose.connection.db
          .collection(analysisResultCollectionName)
          .findOne({});
        console.log("  샘플 문서 (id, subject, timestamp):");
        console.log(`  - ID: ${sample.id}`);
        console.log(`  - 제목: ${sample.subject || "(제목 없음)"}`);
        console.log(`  - 타임스탬프: ${sample.timestamp}`);
      }
    } else {
      console.log(
        "\n⚠️ 분석 결과 컬렉션이 아직 없습니다. 첫 분석 후 생성됩니다."
      );
    }
  } catch (error) {
    console.error("❌ MongoDB 연결 실패!");
    console.error(`오류 메시지: ${error.message}`);

    if (
      error.name === "MongoNetworkError" ||
      error.message.includes("connect")
    ) {
      console.log("\n🔍 문제 해결 방법:");
      console.log("1. MongoDB 서버가 실행 중인지 확인하세요.");
      console.log("2. 연결 문자열(MONGODB_URI)이 올바른지 확인하세요.");
      console.log("3. 방화벽 설정을 확인하세요.");
    }
  } finally {
    // 연결 종료
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log("\n🔌 MongoDB 연결 종료");
    }
  }
}

function getConnectionStateName(state) {
  const states = {
    0: "연결 끊김",
    1: "연결됨",
    2: "연결 중",
    3: "연결 끊는 중",
  };
  return states[state] || `알 수 없음 (${state})`;
}

// 스크립트 실행
checkDbConnection().catch(console.error);
