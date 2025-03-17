// No need to import React with modern JSX transform
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { ProjectTechnologyForm } from "../../components/project-technology-form";
import { client } from "../../lib/amplify-client";

export function meta() {
  return [
    { title: "New Project Technology - Agile Studio" },
    {
      name: "description",
      content: "Create a new project technology for Agile Studio",
    },
  ];
}

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();

  const name = formData.get("name") as string;

  if (!name) {
    return { error: "Name is required" };
  }

  // Create the project technology with the Amplify client
  const { data, errors } = await client.models.ProjectTechnology.create({
    name,
  });

  return {
    projectTechnology: data,
    error: errors?.map((error) => error.message)?.join(", "),
  };
}

import type { Schema } from "../../../amplify/data/resource";

interface ActionData {
  projectTechnology?: Schema["ProjectTechnology"]["type"];
  error?: string;
}

export default function NewProjectTechnology({
  actionData,
}: {
  actionData: ActionData | undefined;
}) {
  const navigate = useNavigate();
  const { projectTechnology, error } = actionData || {
    projectTechnology: undefined,
    error: undefined,
  };

  // If project technology was created successfully, navigate to project technologies list
  useEffect(() => {
    if (projectTechnology && !error) {
      navigate("/project-technologies");
    }
  }, [projectTechnology, error, navigate]);

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
