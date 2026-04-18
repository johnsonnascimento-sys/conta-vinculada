import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { canAccessRoute } from "@/features/auth/permissions";
import { SESSION_COOKIE_NAME } from "@/server/auth/constants";
import { verifySignedToken } from "@/server/auth/crypto";

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  const pathname = request.nextUrl.pathname;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (pathname.startsWith("/dashboard")) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const rawPayload = await verifySignedToken(sessionToken);

    if (!rawPayload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = JSON.parse(rawPayload) as {
      role: string;
      exp: number;
    };

    if (session.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!canAccessRoute(session.role, pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname === "/login" && sessionToken) {
    const rawPayload = await verifySignedToken(sessionToken);

    if (rawPayload) {
      const session = JSON.parse(rawPayload) as { exp: number };

      if (session.exp * 1000 >= Date.now()) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
