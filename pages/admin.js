import { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";

export default function Admin() {
  const [portfolios, setPortfolios] = useState([]);
  const [currentPortfolio, setCurrentPortfolio] = useState({
    title: "",
    description: "",
    mediaFiles: [],
  });
  const [isEditing, setIsEditing] = useState(false);

  // 로컬 스토리지에서 포트폴리오 데이터 로드
  useEffect(() => {
    const savedPortfolios = localStorage.getItem("portfolioData");
    if (savedPortfolios) {
      setPortfolios(JSON.parse(savedPortfolios));
    }
  }, []);

  // 포트폴리오 데이터 저장
  const savePortfolios = (newPortfolios) => {
    setPortfolios(newPortfolios);
    localStorage.setItem("portfolioData", JSON.stringify(newPortfolios));

    // Scene3D.js 파일도 업데이트하는 API 호출 (선택사항)
    // updatePortfolioData(newPortfolios);
  };

  const handleSavePortfolio = () => {
    if (!currentPortfolio.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    const newPortfolios = isEditing
      ? portfolios.map((p) =>
          p.id === currentPortfolio.id ? currentPortfolio : p
        )
      : [...portfolios, { ...currentPortfolio, id: Date.now() }];

    savePortfolios(newPortfolios);
    setCurrentPortfolio({ title: "", description: "", mediaFiles: [] });
    setIsEditing(false);
  };

  const handleEditPortfolio = (portfolio) => {
    setCurrentPortfolio(portfolio);
    setIsEditing(true);
  };

  const handleDeletePortfolio = (id) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      const newPortfolios = portfolios.filter((p) => p.id !== id);
      savePortfolios(newPortfolios);
    }
  };

  const handleUploadComplete = (uploadedFiles) => {
    setCurrentPortfolio((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...uploadedFiles],
    }));
  };

  const removeMediaFile = (index) => {
    setCurrentPortfolio((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
    }));
  };

  const exportToScene3D = () => {
    const exportData = portfolios.map((p) => ({
      title: p.title,
      description: p.description,
      mediaFiles: p.mediaFiles,
    }));

    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    alert(
      "포트폴리오 데이터가 클립보드에 복사되었습니다. Scene3D.js의 portfolioData 배열에 붙여넣으세요."
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#121212",
        color: "white",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            color: "#E8B059",
            fontSize: "32px",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          포트폴리오 관리자
        </h1>

        {/* 포트폴리오 편집 폼 */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: "12px",
            padding: "30px",
            marginBottom: "30px",
            border: "1px solid rgba(232, 176, 89, 0.3)",
          }}
        >
          <h2 style={{ color: "#E8B059", marginBottom: "20px" }}>
            {isEditing ? "포트폴리오 수정" : "새 포트폴리오 추가"}
          </h2>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", color: "#ccc" }}
            >
              제목
            </label>
            <input
              type="text"
              value={currentPortfolio.title}
              onChange={(e) =>
                setCurrentPortfolio((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "#333",
                color: "white",
                fontSize: "16px",
              }}
              placeholder="포트폴리오 제목을 입력하세요"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", color: "#ccc" }}
            >
              설명
            </label>
            <textarea
              value={currentPortfolio.description}
              onChange={(e) =>
                setCurrentPortfolio((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "#333",
                color: "white",
                fontSize: "16px",
                minHeight: "100px",
                resize: "vertical",
              }}
              placeholder="포트폴리오 설명을 입력하세요"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{ display: "block", marginBottom: "8px", color: "#ccc" }}
            >
              미디어 파일
            </label>
            <FileUpload onUploadComplete={handleUploadComplete} />
          </div>

          {/* 업로드된 파일 목록 */}
          {currentPortfolio.mediaFiles.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ color: "#E8B059", marginBottom: "15px" }}>
                업로드된 파일
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "15px",
                }}
              >
                {currentPortfolio.mediaFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "#333",
                      borderRadius: "8px",
                      padding: "15px",
                      position: "relative",
                    }}
                  >
                    <button
                      onClick={() => removeMediaFile(index)}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        width: "25px",
                        height: "25px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,0,0,0.7)",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      ✕
                    </button>

                    {file.type === "image" && (
                      <img
                        src={file.url}
                        alt={file.alt}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          marginBottom: "8px",
                        }}
                      />
                    )}

                    <div style={{ fontSize: "12px", color: "#ccc" }}>
                      {file.type} - {file.originalName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleSavePortfolio}
              style={{
                backgroundColor: "#E8B059",
                color: "black",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              {isEditing ? "수정" : "저장"}
            </button>

            {isEditing && (
              <button
                onClick={() => {
                  setCurrentPortfolio({
                    title: "",
                    description: "",
                    mediaFiles: [],
                  });
                  setIsEditing(false);
                }}
                style={{
                  backgroundColor: "#666",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
            )}
          </div>
        </div>

        {/* 포트폴리오 목록 */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: "12px",
            padding: "30px",
            border: "1px solid rgba(232, 176, 89, 0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ color: "#E8B059", margin: 0 }}>
              포트폴리오 목록 ({portfolios.length})
            </h2>
            <button
              onClick={exportToScene3D}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Scene3D로 내보내기
            </button>
          </div>

          {portfolios.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "#666", padding: "40px" }}
            >
              아직 포트폴리오가 없습니다.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  style={{
                    backgroundColor: "#333",
                    borderRadius: "8px",
                    padding: "20px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: "#E8B059", marginBottom: "10px" }}>
                        {portfolio.title}
                      </h3>
                      <p
                        style={{
                          color: "#ccc",
                          marginBottom: "10px",
                          lineHeight: "1.5",
                        }}
                      >
                        {portfolio.description}
                      </p>
                      <div style={{ color: "#999", fontSize: "14px" }}>
                        {portfolio.mediaFiles.length}개의 미디어 파일
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleEditPortfolio(portfolio)}
                        style={{
                          backgroundColor: "#E8B059",
                          color: "black",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeletePortfolio(portfolio.id)}
                        style={{
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
