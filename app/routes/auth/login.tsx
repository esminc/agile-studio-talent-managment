import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { getCurrentUser } from "aws-amplify/auth";
import { redirect } from "react-router";

export function meta() {
  return [
    { title: "Login - Agile Studio" },
    { name: "description", content: "Login to Agile Studio" },
  ];
}

export async function clientLoader() {
  try {
    const user = await getCurrentUser();
    if (user) {
      return redirect("/");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // ignore error
  }
  return {};
}

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Authenticator />
      </div>
    </div>
  );
}
