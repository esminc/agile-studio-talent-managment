import {
  data,
  isRouteErrorResponse,
  redirect,
  useNavigate,
} from "react-router";
import { AccountForm } from "~/components/account-form";
import { client } from "~/lib/amplify-ssr-client";
import type { Route } from "./+types/edit";
import { updateProjectAssignments } from "~/lib/account";
import { runWithAmplifyServerContext } from "~/lib/amplifyServerUtils";

export function meta() {
  return [
    { title: "Edit Account - Agile Studio" },
    { name: "description", content: "Edit an account for Agile Studio" },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  return runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: async (contextSpec) => {
      try {
        const accountId = params.accountId;
        const { data: account } = await client.models.Account.get(
          contextSpec,
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
          throw data(
            { error: "Account not found" },
            { status: 404, headers: responseHeaders },
          );
        }

        const { data: projects } = await client.models.Project.list(
          contextSpec,
          {
            selectionSet: ["id", "name", "clientName", "startDate", "endDate"],
          },
        );

        return data(
          {
            account,
            projects,
          },
          { headers: responseHeaders },
        );
      } catch (err) {
        console.error("Error fetching account:", err);
        throw data(
          {
            error:
              err instanceof Error ? err.message : "Unknown error occurred",
          },
          { status: 500, headers: responseHeaders },
        );
      }
    },
  });
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const accountId = params.accountId;

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const photo = formData.get("photo") as string;
  const organizationLine = formData.get("organizationLine") as string;
  const residence = formData.get("residence") as string;
  const projectAssignmentsJson = formData.get("projectAssignments") as string;

  if (!name || !organizationLine || !residence) {
    return data({
      error: "Name, Organization Line, and Residence are required",
    });
  }

  const responseHeaders = new Headers();
  return runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: async (contextSpec) => {
      const { data: updatedAccount, errors } =
        await client.models.Account.update(
          contextSpec,
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
        throw data(
          {
            error: errors.map((error) => error.message).join(", "),
          },
          { status: 400, headers: responseHeaders },
        );
      }

      if (projectAssignmentsJson && updatedAccount) {
        const projectAssignments = JSON.parse(projectAssignmentsJson);

        await updateProjectAssignments({
          contextSpec,
          account: updatedAccount,
          projectAssignments,
        });
      }

      return redirect(`/accounts/${accountId}`, {
        headers: responseHeaders,
      });
    },
  });
}

export default function EditAccount({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { account, projects = [] } = loaderData;

  const { error: actionError } = actionData || {
    error: undefined,
  };

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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const navigate = useNavigate();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error.data.error}
        </div>
        <button
          onClick={() => navigate("/accounts")}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          アカウント一覧に戻る
        </button>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
