// No need to import React with modern JSX transform
import { data, redirect, useNavigate } from "react-router";
import { AccountForm } from "../../components/account-form";
import type { Route } from "./+types/new";
import { client } from "../../lib/amplify-ssr-client";
import { runWithAmplifyServerContext } from "~/lib/amplifyServerUtils";

export function meta() {
  return [
    { title: "New Account - Agile Studio" },
    { name: "description", content: "Create a new account for Agile Studio" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const photo = formData.get("photo") as string;
  const organizationLine = formData.get("organizationLine") as string;
  const residence = formData.get("residence") as string;

  if (!name || !organizationLine || !residence) {
    return data({
      account: null,
      error: "Name, Organization Line, and Residence are required",
    });
  }

  const responseHeaders = new Headers();
  return runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: async (contextSpec) => {
      // Create the account with the Amplify client
      const { errors } = await client.models.Account.create(contextSpec, {
        name,
        email,
        photo: photo || undefined,
        organizationLine,
        residence,
      });
      if (errors) {
        return {
          account: null,
          error: errors?.map((error) => error.message)?.join(", "),
        };
      }
      return redirect("/accounts", {
        headers: responseHeaders,
      });
    },
  });
}

export default function NewAccount({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { error } = actionData || {
    error: undefined,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Account</h1>
      <AccountForm
        error={error ? new Error(error) : null}
        onCancel={() => navigate("/accounts")}
      />
    </div>
  );
}
