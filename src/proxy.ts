import { NextRequest, NextResponse } from "next/server";

const publicRoute = ["/login"];

export function proxy(request: NextRequest) {

    const { pathname } = request.nextUrl;

    const accessToken = request.cookies.get("accessToken")?.value;

    const isPublicRoute = publicRoute.includes(pathname);

    if (!isPublicRoute && !accessToken) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    if (accessToken && pathname === "/login") {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        
        "/dashboard",
        "/departments",
        "/users",
        "/roles",
        "/permissions",

        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
