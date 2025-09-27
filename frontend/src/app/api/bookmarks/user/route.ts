import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const type = searchParams.get("type");

    const authHeader = request.headers.get("authorization");

    const params = new URLSearchParams({
      page,
      limit,
    });

    if (type && type !== "ALL") {
      params.append("type", type);
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/bookmarks?${params.toString()}`,
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
    console.error("Error fetching user bookmarks:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "Có lỗi xảy ra khi lấy danh sách bookmark",
      },
      { status: 500 }
    );
  }
}
