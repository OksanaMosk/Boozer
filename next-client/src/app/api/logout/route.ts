import { NextResponse } from "next/server";

export function POST() {
  const response = NextResponse.redirect(new URL("/", "http://localhost:3000"));
  response.cookies.set("authToken", "", { maxAge: 0 });
  response.cookies.set("refreshToken", "", { maxAge: 0 });
  response.cookies.set("userEmail", "", { maxAge: 0 });
  return response;
}


