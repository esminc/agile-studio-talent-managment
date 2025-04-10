import {
  data,
  isRouteErrorResponse,
  redirect,
  useNavigate,
} from "react-router";
import { ProjectTechnologyForm } from "~/components/project-technology-form";
import { client } from "~/lib/amplify-ssr-client";
import { runWithAmplifyServerContext } from "~/lib/amplifyServerUtils";
import type { Route } from "./+types/edit";

export function meta() {
  return [
    { title: "Edit Project Technology - Agile Studio" },
    {
      name: "description",
      content: "Edit a project technology for Agile Studio",
    },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  return runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: async (contextSpec) => {
      try {
        const projectTechnologyId = params.projectTechnologyId;
        const { data: projectTechnology, errors } =
          await client.models.ProjectTechnology.get(
            contextSpec,
            {
              id: projectTechnologyId,
            },
            {
              selectionSet: ["id", "name", "description"],
            },
          );

        if (errors) {
          throw data(
            {
              error: errors.map((error) => error.message).join(", "),
            },
            { headers: responseHeaders },
          );
        }

        if (!projectTechnology) {
          throw data(
            {
              error: "Project Technology not found",
            },
            { headers: responseHeaders },
          );
        }

        return data(
          {
            projectTechnology,
          },
          { headers: responseHeaders },
        );
      } catch (err) {
        console.error("Error fetching project technology:", err);
        throw data(
          {
            projectTechnology: null,
            error:
              err instanceof Error ? err.message : "Unknown error occurred",
          },
          { headers: responseHeaders },
        );
      }
    },
  });
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const projectTechnologyId = params.projectTechnologyId;

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { error: "Name is required" };
  }

  const responseHeaders = new Headers();
  return runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: async (contextSpec) => {
      try {
        const { errors } = await client.models.ProjectTechnology.update(
          contextSpec,
          {
            id: projectTechnologyId,
            name,
            description,
          },
          {
            selectionSet: ["id", "name", "description"],
          },
        );

        if (errors) {
          return data(
            { error: errors.map((error) => error.message).join(", ") },
            {
              headers: responseHeaders,
            },
          );
        }

        return redirect("/project-technologies", {
          headers: responseHeaders,
        });
      } catch (err) {
        console.error("Error updating project technology:", err);
        return data(
          {
            error:
              err instanceof Error ? err.message : "Unknown error occurred",
          },
          {
            headers: responseHeaders,
          },
        );
      }
    },
  });
}

export default function EditProjectTechnology({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { projectTechnology } = loaderData;

  const { error: actionError } = actionData || {
    error: undefined,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Project Technology</h1>

      {actionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {actionError}
        </div>
      )}

      <div className="mb-8">
        <ProjectTechnologyForm
          error={actionError ? new Error(actionError) : null}
          onCancel={() => navigate("/project-technologies")}
          projectTechnology={projectTechnology}
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
          onClick={() => navigate("/project-technologies")}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Back to Project Technologies
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
