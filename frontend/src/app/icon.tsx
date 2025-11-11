import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "khotruyen.vn";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#1e40af",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
        }}
      >
        K
      </div>
    ),
    {
      ...size,
    }
  );
}
