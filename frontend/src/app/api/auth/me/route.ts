import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const backendRes = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: { Cookie: `access_token=${token}` },
  });

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}
