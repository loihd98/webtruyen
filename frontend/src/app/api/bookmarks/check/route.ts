import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get("storyId");
    const chapterId = searchParams.get("chapterId");

    const authHeader = request.headers.get("authorization");

    const params = new URLSearchParams();
    if (storyId) params.append("storyId", storyId);
    if (chapterId) params.append("chapterId", chapterId);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/bookmarks/check?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: authHeader || "",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error checking bookmark:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi kiểm tra bookmark",
      },
      { status: 500 }
    );
  }
}
