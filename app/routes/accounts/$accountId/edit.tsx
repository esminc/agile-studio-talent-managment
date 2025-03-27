import { useNavigate } from "react-router";
import { useEffect } from "react";
import { AccountForm } from "~/components/account-form";
import { client } from "~/lib/amplify-client";
import type { Route } from "./+types/edit";
import { updateProjectAssignments } from "~/lib/account";

export function meta() {
  return [
    { title: "Edit Account - Agile Studio" },
    { name: "description", content: "Edit an account for Agile Studio" },
  ];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    const accountId = params.accountId;
    const { data: account } = await client.models.Account.get(
      {
        id: accountId,
      },
      {
        selectionSet: [
          "id",
          "name",
          "email",
          "photo",
          "organizationLine",
          "residence",
          "assignments.id",
          "assignments.projectId",
          "assignments.startDate",
          "assignments.endDate",
        ],
      },
    );

    if (!account) {
      return { error: "Account not found" };
    }

    const { data: projects } = await client.models.Project.list({
      selectionSet: ["id", "name", "clientName", "startDate", "endDate"],
    });

    return {
      account,
      projects,
    };
  } catch (err) {
    console.error("Error fetching account:", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

export async function clientAction({
  request,
  params,
}: Route.ClientActionArgs) {
  const formData = await request.formData();
  const accountId = params.accountId;

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const photo = formData.get("photo") as string;
  const organizationLine = formData.get("organizationLine") as string;
  const residence = formData.get("residence") as string;
  const projectAssignmentsJson = formData.get("projectAssignments") as string;

  if (!name || !organizationLine || !residence) {
    return { error: "Name, Organization Line, and Residence are required" };
  }

  try {
    const { data: updatedAccount, errors } = await client.models.Account.update(
      {
        id: accountId,
        name,
        email,
        photo: photo || undefined,
        organizationLine,
        residence,
      },
      {
        selectionSet: [
          "id",
          "name",
          "email",
          "photo",
          "organizationLine",
          "residence",
          "assignments.id",
          "assignments.projectId",
          "assignments.startDate",
          "assignments.endDate",
        ],
      },
    );

    if (errors) {
      return { error: errors.map((error) => error.message).join(", ") };
    }

    if (projectAssignmentsJson) {
      const projectAssignments = JSON.parse(projectAssignmentsJson);

      await updateProjectAssignments({
        account: updatedAccount,
        projectAssignments,
      });
    }

    return {
      account: updatedAccount,
      success: true,
    };
  } catch (err) {
    console.error("Error updating account:", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

export default function EditAccount({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const {
    account,
    projects = [],
    error: loadError,
  } = loaderData || {
    account: null,
    projects: [],
    error: undefined,
  };

  const { success, error: actionError } = actionData || {
    success: false,
    error: undefined,
  };

  useEffect(() => {
    if (success) {
      navigate(`/accounts/${account?.id}`);
    }
  }, [success, navigate, account]);

  if (loadError) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {loadError}
        </div>
        <button
          onClick={() => navigate("/accounts")}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          アカウント一覧に戻る
        </button>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">アカウントを編集</h1>

      {actionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {actionError}
        </div>
      )}

      <div className="mb-8">
        <AccountForm
          error={actionError ? new Error(actionError) : null}
          onCancel={() => navigate(`/accounts/${account.id}`)}
          account={account}
          projects={projects}
          projectAssignments={account.assignments}
        />
      </div>
    </div>
  );
}
