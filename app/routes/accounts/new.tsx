// No need to import React with modern JSX transform
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { AccountForm } from "../../components/account-form";
import type { Route } from "./+types/new";
import { client } from "../../lib/amplify-client";

export function meta() {
  return [
    { title: "New Account - Agile Studio" },
    { name: "description", content: "Create a new account for Agile Studio" },
  ];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const photo = formData.get("photo") as string;
  const organizationLine = formData.get("organizationLine") as string;
  const residence = formData.get("residence") as string;

  if (!name || !organizationLine || !residence) {
    return { error: "Name, Organization Line, and Residence are required" };
  }

  // Create the account with the Amplify client
  const { data, errors } = await client.models.Account.create({
    name,
    photo: photo || undefined,
    organizationLine,
    residence,
  });

  return {
    account: data,
    error: errors?.map((err) => err.message)?.join(", "),
  };
}

export default function NewAccount({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { account, error } = actionData || {
    account: undefined,
    error: undefined,
  };

  // If account was created successfully, navigate to accounts list
  useEffect(() => {
    if (account && !error) {
      navigate("/accounts");
    }
  }, [account, error, navigate]);

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
