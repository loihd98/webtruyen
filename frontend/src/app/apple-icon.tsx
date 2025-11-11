import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "khotruyen.vn";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 80,
          background: "#1e40af",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          borderRadius: 40,
        }}
      >
        KT
      </div>
    ),
    {
      ...size,
    }
  );
}
