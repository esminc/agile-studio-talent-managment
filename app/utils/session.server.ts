import { createCookieSessionStorage } from "react-router";

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || "default-secret-for-dev";

// Create session storage
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "agile_studio_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});

// Get session from request
export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

// Create a new session
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

// Get user ID from session
export async function getUserId(request: Request) {
  const session = await getSession(request);
  const userId = session.get("userId");
  return userId;
}

// Require user session
export async function requireUserId(
  request: Request,
  redirectTo: string = "/login",
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw new Response(null, {
      status: 302,
      headers: {
        Location: `/login?${searchParams}`,
      },
    });
  }
  return userId;
}

// Logout user
export async function logout(request: Request) {
  const session = await getSession(request);
  return new Response(null, {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
