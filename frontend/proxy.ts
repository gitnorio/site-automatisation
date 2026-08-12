import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";


export function proxy(request: NextRequest) {
  const development = process.env.NODE_ENV === "development";
  const username = process.env.WORKSPACE_BASIC_USERNAME ?? (development ? "koto" : undefined);
  const password = process.env.WORKSPACE_BASIC_PASSWORD
    ?? (development ? "development-workspace-password-change-me" : undefined);
  if (!username || !password) {
    return new Response("L’accès au workspace n’est pas configuré.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
  if (isWorkspaceAuthorized(request.headers.get("authorization"), username, password)) {
    return NextResponse.next();
  }
  return new Response("Authentification requise.", {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": "Basic realm=\"Koto Workspace\", charset=\"UTF-8\"",
    },
  });
}

export function isWorkspaceAuthorized(
  authorization: string | null,
  expectedUsername: string,
  expectedPassword: string,
): boolean {
  if (!authorization?.startsWith("Basic ")) return false;
  try {
    const credentials = atob(authorization.slice(6));
    const separator = credentials.indexOf(":");
    if (separator < 0) return false;
    return credentials.slice(0, separator) === expectedUsername
      && credentials.slice(separator + 1) === expectedPassword;
  } catch {
    return false;
  }
}

export const config = {
  matcher: "/app/:path*",
};
