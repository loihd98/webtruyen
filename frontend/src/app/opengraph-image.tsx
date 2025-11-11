import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "khotruyen.vn - Đọc truyện online miễn phí";
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
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: "bold",
            color: "white",
            marginBottom: 20,
          }}
        >
          KhoTruyen.vn
        </div>
        <div
          style={{
            fontSize: 48,
            color: "#dbeafe",
            marginBottom: 30,
          }}
        >
          Đọc truyện online miễn phí
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#bfdbfe",
            marginBottom: 80,
          }}
        >
          Truyện chữ • Truyện audio • Cập nhật liên tục
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#93c5fd",
          }}
        >
          by Evanloi9x
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
