import { useNavigate } from "react-router";
import { useEffect } from "react";
import { ProjectTechnologyForm } from "~/components/project-technology-form";
import { client } from "~/lib/amplify-client";
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

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    const projectTechnologyId = params.projectTechnologyId;
    const { data: projectTechnology } =
      await client.models.ProjectTechnology.get(
        {
          id: projectTechnologyId,
        },
        {
          selectionSet: ["id", "name", "description"],
        },
      );

    if (!projectTechnology) {
      return { error: "Project Technology not found" };
    }

    return {
      projectTechnology,
    };
  } catch (err) {
    console.error("Error fetching project technology:", err);
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
  const projectTechnologyId = params.projectTechnologyId;

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { error: "Name is required" };
  }

  try {
    const { data: updatedProjectTechnology, errors } =
      await client.models.ProjectTechnology.update(
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
      return { error: errors.map((error) => error.message).join(", ") };
    }

    return {
      projectTechnology: updatedProjectTechnology,
      success: true,
    };
  } catch (err) {
    console.error("Error updating project technology:", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

export default function EditProjectTechnology({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { projectTechnology, error: loadError } = loaderData || {
    projectTechnology: null,
    error: undefined,
  };

  const { success, error: actionError } = actionData || {
    success: false,
    error: undefined,
  };

  useEffect(() => {
    if (success) {
      navigate("/project-technologies");
    }
  }, [success, navigate]);

  if (loadError) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {loadError}
        </div>
        <button
          onClick={() => navigate("/project-technologies")}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Back to Project Technologies
        </button>
      </div>
    );
  }

  if (!projectTechnology) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading project technology...</p>
        </div>
      </div>
    );
  }

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
