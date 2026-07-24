import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Design Imp — Custom websites for small and medium businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111113",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#C8973A",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          Design Imp
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 600,
            color: "#f0f0f2",
            lineHeight: 1.15,
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Your best work deserves a better website.
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#a0a0a8",
            marginTop: 32,
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          Custom websites for small and medium businesses. Fixed price, one point of contact.
        </div>
      </div>
    ),
    { ...size }
  );
}
