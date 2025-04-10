// No need to import React with modern JSX transform
import { data, redirect, useNavigate } from "react-router";
import { ProjectTechnologyForm } from "../../components/project-technology-form";
import { client } from "~/lib/amplify-ssr-client";
import { runWithAmplifyServerContext } from "~/lib/amplifyServerUtils";
import type { Route } from "./+types/new";

export function meta() {
  return [
    { title: "New Project Technology - Agile Studio" },
    {
      name: "description",
      content: "Create a new project technology for Agile Studio",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

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
        // Create the project technology with the Amplify client
        const { errors } = await client.models.ProjectTechnology.create(
          contextSpec,
          {
            name,
            description,
          },
        );
        if (errors) {
          return data(
            { error: errors?.map((error) => error.message)?.join(", ") },
            { headers: responseHeaders },
          );
        }
        return redirect("/project-technologies", { headers: responseHeaders });
      } catch (err) {
        console.error("Error creating project technology:", err);
        return {
          //projectTechnology: undefined,
          error: err instanceof Error ? err.message : "Unknown error occurred",
        };
      }
    },
  });
}

export default function NewProjectTechnology({
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { error } = actionData || {};

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Project Technology</h1>
      <ProjectTechnologyForm
        error={error ? new Error(error) : null}
        onCancel={() => navigate("/project-technologies")}
      />
    </div>
  );
}
