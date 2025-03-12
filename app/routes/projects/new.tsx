// No need to import React with modern JSX transform
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { ProjectForm } from "~/components/project-form";
import { client } from "~/lib/amplify-client";
import type { Route } from "../projects/+types/new";

export function meta() {
  return [
    { title: "New Project - Agile Studio" },
    { name: "description", content: "Create a new project for Agile Studio" },
  ];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const clientName = formData.get("clientName") as string;
  const overview = formData.get("overview") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;

  if (!name || !clientName || !overview || !startDate || !endDate) {
    return { error: "All fields are required" };
  }

  // Create the project with the Amplify client
  const { data, errors } = await client.models.Project.create({
    name,
    clientName,
    overview,
    startDate,
    endDate,
  });

  return {
    project: data,
    error: errors?.map((error) => error.message)?.join(", "),
  };
}

export default function NewProject({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { project, error } = actionData || {
    project: undefined,
    error: undefined,
  };

  // If project was created successfully, navigate to projects list
  useEffect(() => {
    if (project && !error) {
      navigate("/projects");
    }
  }, [project, error, navigate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
      <ProjectForm
        error={error ? new Error(error) : null}
        onCancel={() => navigate("/projects")}
      />
    </div>
  );
}
