import { useNavigate } from "react-router";
import { useEffect } from "react";
import { ProjectForm } from "~/components/project-form";
import { client } from "~/lib/amplify-client";
import { MultiSelect } from "~/components/ui/multi-select";
import type { Route } from "../+types/projects/$projectId/edit";

export function meta() {
  return [
    { title: "Edit Project - Agile Studio" },
    { name: "description", content: "Edit a project for Agile Studio" },
  ];
}

export async function clientLoader({ params }) {
  try {
    const projectId = params.projectId;
    const { data: project } = await client.models.Project.get({
      id: projectId,
      selectionSet: [
        "id",
        "name",
        "clientName",
        "overview",
        "startDate",
        "endDate",
        "technologies.*",
      ],
    });

    if (!project) {
      return { error: "Project not found" };
    }

    const { data: techData } = await client.models.ProjectTechnology.list({
      selectionSet: ["id", "name"],
    });

    return {
      project,
      technologies: techData,
      linkedTechIds: project.technologies.map((tech) => tech.technologyId),
    };
  } catch (err) {
    console.error("Error fetching project:", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

export async function clientAction({ request, params }) {
  const formData = await request.formData();
  const projectId = params.projectId;

  const name = formData.get("name") as string;
  const clientName = formData.get("clientName") as string;
  const overview = formData.get("overview") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const selectedTechIds = formData.get("selectedTechnologies") as string;

  const techIds = selectedTechIds ? JSON.parse(selectedTechIds) : [];

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
    );

    if (errors) {
      return { error: errors.map((error) => error.message).join(", ") };
    }

    const { data: currentLinks } = await client.models.Project.get({
      id: projectId,
      selectionSet: ["technologies.*"],
    });

    const currentTechIds = currentLinks.technologies.map(
      (tech) => tech.technologyId,
    );

    const techToRemove = currentTechIds.filter((id) => !techIds.includes(id));
    for (const techId of techToRemove) {
      await client.models.ProjectTechnologyLink.delete({
        projectId: projectId,
        technologyId: techId,
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
    linkedTechIds,
    error: loadError,
  } = loaderData || {
    project: null,
    technologies: [],
    linkedTechIds: [],
    error: undefined,
  };

  const { success, error: actionError } = actionData || {
    success: false,
    error: undefined,
  };

  useEffect(() => {
    if (success) {
      navigate(`/projects/${project.id}`);
    }
  }, [success, navigate, project]);

  const [selectedTechIds, setSelectedTechIds] = React.useState(
    linkedTechIds || [],
  );

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

  const techOptions = technologies.map((tech) => ({
    value: tech.id,
    label: tech.name,
  }));

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
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Project Technologies</h2>

        <form method="post">
          {/* Hidden fields to carry over project data */}
          <input type="hidden" name="name" value={project.name} />
          <input type="hidden" name="clientName" value={project.clientName} />
          <input type="hidden" name="overview" value={project.overview} />
          <input type="hidden" name="startDate" value={project.startDate} />
          <input type="hidden" name="endDate" value={project.endDate || ""} />
          <input
            type="hidden"
            name="selectedTechnologies"
            value={JSON.stringify(selectedTechIds)}
          />

          <div className="space-y-4">
            {technologies.length === 0 ? (
              <p className="text-gray-500">No technologies available.</p>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Technologies
                </label>
                <MultiSelect
                  options={techOptions}
                  selected={selectedTechIds}
                  onChange={setSelectedTechIds}
                  placeholder="Select technologies..."
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
