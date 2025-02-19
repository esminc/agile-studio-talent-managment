// Removed unused React import
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Button } from "../components/ui/button";

export function meta() {
  return [
    { title: "Login - Agile Studio" },
    { name: "description", content: "Login to Agile Studio" },
  ];
}

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Authenticator>
          {({ signOut }) => (
            <div className="text-center">
              <p className="mb-4">Successfully logged in!</p>
              <Button onClick={signOut}>Sign Out</Button>
            </div>
          )}
        </Authenticator>
      </div>
    </div>
  );
}
