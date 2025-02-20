import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Navigate } from "react-router";

export function meta() {
  return [
    { title: "Login - Agile Studio" },
    { name: "description", content: "Login to Agile Studio" },
  ];
}

export default function Login() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  if (authStatus === "authenticated") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Authenticator />
      </div>
    </div>
  );
}
