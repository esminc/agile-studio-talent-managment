import { useNavigate } from "react-router";
import { useEffect } from "react";
import { ProjectForm } from "~/components/project-form";
import { client } from "~/lib/amplify-client";
import type { Route } from "./+types/edit";

export function meta() {
  return [
    { title: "Edit Project - Agile Studio" },
    { name: "description", content: "Edit a project for Agile Studio" },
  ];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    const projectId = params.projectId;
    const { data: project } = await client.models.Project.get(
      {
        id: projectId,
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

    if (!project) {
      return { error: "Project not found" };
    }

    const { data: techData } = await client.models.ProjectTechnology.list({
      selectionSet: ["id", "name"],
    });

    return {
      project,
      technologies: techData,
    };
  } catch (err) {
    console.error("Error fetching project:", err);
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
  const projectId = params.projectId;

  const name = formData.get("name") as string;
  const clientName = formData.get("clientName") as string;
  const overview = formData.get("overview") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const selectedTechIds = formData.get("selectedTechnologies") as string;

  const techIds: string[] = selectedTechIds ? JSON.parse(selectedTechIds) : [];

  if (!name || !clientName || !overview || !startDate) {
    return { error: "All required fields must be filled out" };
  }

  try {
    const { data: updatedProject, errors } = await client.models.Project.update(
      {
        id: projectId,
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

    if (errors) {
      return { error: errors.map((error) => error.message).join(", ") };
    }

    const { data: currentLinks } = await client.models.Project.get(
      {
        id: projectId,
      },
      {
        selectionSet: ["technologies.*"],
      },
    );

    const currentTechIds =
      currentLinks?.technologies.map((tech) => tech.technologyId) ?? [];

    const linksToRemove =
      currentLinks?.technologies.filter(
        (link) => !techIds.includes(link.technologyId),
      ) ?? [];
    for (const linkToRemove of linksToRemove) {
      await client.models.ProjectTechnologyLink.delete({
        id: linkToRemove.id,
      });
    }

    const techToAdd = techIds.filter((id) => !currentTechIds.includes(id));
    for (const techId of techToAdd) {
      await client.models.ProjectTechnologyLink.create({
        projectId: projectId,
        technologyId: techId,
      });
    }

    return {
      project: updatedProject,
      success: true,
    };
  } catch (err) {
    console.error("Error updating project:", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

export default function EditProject({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const {
    project,
    technologies,
    error: loadError,
  } = loaderData || {
    project: null,
    technologies: [],
    error: undefined,
  };

  const { success, error: actionError } = actionData || {
    success: false,
    error: undefined,
  };

  useEffect(() => {
    if (success) {
      navigate(`/projects/${project?.id}`);
    }
  }, [success, navigate, project]);

  if (loadError) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {loadError}
        </div>
        <button
          onClick={() => navigate("/projects")}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Project</h1>

      {actionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {actionError}
        </div>
      )}

      <div className="mb-8">
        <ProjectForm
          error={actionError ? new Error(actionError) : null}
          onCancel={() => navigate(`/projects/${project.id}`)}
          project={project}
          technologies={technologies}
        />
      </div>
    </div>
  );
}
