import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//     const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
//     const {pathname} = req.nextUrl;
//
//     if (
//         pathname.startsWith("/api/auth") ||
//         pathname.startsWith("/_next") ||
//         pathname.includes("/favicon")
//     )
//     {
//         return NextResponse.next();
//     }
//
//     if (!token) {
//
//           if (pathname === "/login" || pathname === "/register") {
//             return NextResponse.next();
//         }
//
//         const loginUrl = new URL("/login", req.url);
//         loginUrl.searchParams.set("callbackUrl", pathname);
//         return NextResponse.redirect(loginUrl);
//     }
//     const userRole = token.role as string;
//     if (pathname.startsWith("/admin") && userRole !== "admin") {
//         return NextResponse.redirect(new URL("/", req.url));
//     }
//     if (pathname.startsWith("/venue_admin") && userRole !== "venue_admin") {
//         return NextResponse.redirect(new URL("/", req.url));
//     }
//     if (pathname.startsWith("/visitor") && userRole !== "visitor") {
//         return NextResponse.redirect(new URL("/", req.url));
//     }
//     return NextResponse.next();
// }
// export const config = {
//     matcher: [
//         "/dashboard/:path*",
//         "/admin/:path*",
//         "/venue_admin/:path*",
//         "/visitor/:path*",
//         "/profile/:path*",
//     ],
// };
//
