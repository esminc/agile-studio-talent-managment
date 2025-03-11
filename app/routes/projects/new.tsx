// No need to import React with modern JSX transform
import { useNavigate } from "react-router";
import type { Schema } from "../../../amplify/data/resource";
import { ProjectForm } from "~/components/project-form";
import { client } from "~/lib/amplify-client";

// Define Route type locally until type generation is properly set up
export interface RouteComponentProps {
  loaderData: {
    project?: Schema["Project"]["type"];
    error?: string;
  };
}

export interface RouteClientActionArgs {
  request: Request;
}

export function meta() {
  return [
    { title: "New Project - Agile Studio" },
    { name: "description", content: "Create a new project for Agile Studio" },
  ];
}

export async function clientAction({ request }: RouteClientActionArgs) {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const clientName = formData.get("clientName") as string;
  const overview = formData.get("overview") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;

  if (!name || !clientName || !overview || !startDate || !endDate) {
    return { error: "All fields are required" };
  }

  try {
    // Create the project with the Amplify client
    // The schema expects date objects for startDate and endDate
    const result = await client.models.Project.create({
      name,
      clientName,
      overview,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    } as unknown as Schema["Project"]["type"]); // Use type assertion with proper type

    return { project: result };
  } catch (err) {
    console.error("Error creating project:", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

export default function NewProject({ loaderData }: RouteComponentProps) {
  const navigate = useNavigate();
  const { project, error } = loaderData || {};

  // If project was created successfully, navigate to projects list
  if (project && !error) {
    navigate("/projects");
  }

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
