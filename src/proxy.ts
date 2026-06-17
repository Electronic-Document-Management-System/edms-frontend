import { NextRequest, NextResponse } from "next/server";

const publicRoute = ["/login"];

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    if (!payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true; 
  }
}

export function proxy(request: NextRequest) {

    const { pathname } = request.nextUrl;

    const accessToken = request.cookies.get("accessToken")?.value;

    const isPublicRoute = publicRoute.includes(pathname);

    const hasValidToken = accessToken && !isTokenExpired(accessToken)

    if (!isPublicRoute && !hasValidToken) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    if (hasValidToken && pathname === "/login") {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        
        "/dashboard",
        "/departments",
        "/folders",
        "/documents",
        "/users",
        "/roles",
        "/permissions",

        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
