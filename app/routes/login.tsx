import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useLoaderData, useNavigate } from "react-router";
import { useEffect } from "react";

export function meta() {
  return [
    { title: "Login - Agile Studio" },
    { name: "description", content: "Login to Agile Studio" },
  ];
}

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/";
  return { redirectTo };
};

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const { login } = await import("../utils/auth.server");

  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo") || "/";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    return await login(
      email.toString(),
      password.toString(),
      redirectTo.toString(),
    );
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to login",
    };
  }
};

export default function Login() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const { redirectTo } = useLoaderData();
  const navigate = useNavigate();

  useEffect(() => {
    if (authStatus === "authenticated") {
      navigate(redirectTo, { replace: true });
    }
  }, [authStatus, navigate, redirectTo]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Authenticator />
      </div>
    </div>
  );
}
