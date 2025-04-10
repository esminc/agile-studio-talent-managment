// No need to import React with modern JSX transform
import { data, redirect, useNavigate } from "react-router";
import { ProjectForm } from "~/components/project-form";
import { client } from "~/lib/amplify-ssr-client";
import type { Route } from "../projects/+types/new";
import { updateProjectTechnologyLinks } from "~/lib/project";
import { runWithAmplifyServerContext } from "~/lib/amplifyServerUtils";

export function meta() {
  return [
    { title: "New Project - Agile Studio" },
    { name: "description", content: "Create a new project for Agile Studio" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  return runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: async (contextSpec) => {
      try {
        const { data: techData } = await client.models.ProjectTechnology.list(
          contextSpec,
          {
            selectionSet: ["id", "name"],
          },
        );
        return data(
          {
            technologies: techData,
          },
          { headers: responseHeaders },
        );
      } catch (err) {
        console.error("Error fetching project technologies:", err);
        return data(
          {
            technologies: [],
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

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const clientName = formData.get("clientName") as string;
  const overview = formData.get("overview") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const selectedTechIds = formData.get("selectedTechnologies") as string;

  const techIds: string[] = selectedTechIds ? JSON.parse(selectedTechIds) : [];

  if (!name || !clientName || !overview || !startDate) {
    return { project: null, error: "All fields are required" };
  }

  // Create the project with the Amplify client
  const responseHeaders = new Headers();
  return await runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: async (contextSpec) => {
      try {
        const { data: project, errors } = await client.models.Project.create(
          contextSpec,
          {
            name,
            clientName,
            overview,
            startDate,
            endDate: endDate || null,
          },
          {
            selectionSet: [
              "id",
              "name",
              "clientName",
              "overview",
              "startDate",
              "endDate",
              "technologies.*",
            ],
          },
        );
        if (project) {
          await updateProjectTechnologyLinks({
            contextSpec,
            project,
            projectTechnologyIds: techIds,
          });
        }
        if (errors) {
          return data(
            { error: errors?.map((error) => error.message)?.join(", ") },
            { headers: responseHeaders },
          );
        }
        // Redirect to the projects page after successful creation
        return redirect("/projects", {
          headers: responseHeaders,
        });
      } catch (err) {
        console.error("Error creating project:", err);
        return {
          project: null,
          error: err instanceof Error ? err.message : "Unknown error occurred",
        };
      }
    },
  });
}

export default function NewProject({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { technologies } = loaderData;
  const { error } = actionData || {
    project: undefined,
    error: undefined,
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
      <ProjectForm
        error={error ? new Error(error) : null}
        onCancel={() => navigate("/projects")}
        technologies={technologies}
      />
    </div>
  );
}
