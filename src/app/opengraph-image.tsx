import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "StatementToExcel - PDF Bank Statement to Excel Converter";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "#f8fafc",
          padding: "40px",
        }}
      >
        {/* Brand Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              background: "#3b82f6",
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "20px",
            }}
          >
            {/* Mock Spreadsheet icon */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "32px",
                height: "32px",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "8px", height: "8px", background: "#ffffff", borderRadius: "2px" }} />
                <div style={{ width: "20px", height: "8px", background: "#ffffff", borderRadius: "2px" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "8px", height: "8px", background: "#ffffff", borderRadius: "2px" }} />
                <div style={{ width: "20px", height: "8px", background: "#ffffff", borderRadius: "2px" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "8px", height: "8px", background: "#ffffff", borderRadius: "2px" }} />
                <div style={{ width: "20px", height: "8px", background: "#ffffff", borderRadius: "2px" }} />
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              letterSpacing: "-0.05em",
            }}
          >
            StatementToExcel
          </span>
        </div>

        {/* Head */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: 800,
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.2,
            marginBottom: "20px",
            color: "#60a5fa",
          }}
        >
          Convert PDF Bank Statements to Excel Instantly
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "750px",
            lineHeight: 1.4,
          }}
        >
          Preview, edit transactions in a spreadsheet grid, and export securely to XLSX or CSV online.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
