import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/quotation", "/history-job", "/master-data"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (pathname === "/login" && req.auth) {
    return NextResponse.redirect(new URL("/quotation", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
