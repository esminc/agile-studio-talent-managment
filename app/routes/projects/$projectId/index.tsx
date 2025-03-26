import { useNavigate } from "react-router";
import { client } from "~/lib/amplify-client";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { Route } from "../+types/projects/$projectId";

export function meta() {
  return [
    { title: "Project Details - Agile Studio" },
    { name: "description", content: "Project details for Agile Studio" },
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

    const techIds = project.technologies.map((tech) => tech.technologyId);
    let technologies = [];

    if (techIds.length > 0) {
      const { data: techData } = await client.models.ProjectTechnology.list({
        filter: { id: { in: techIds } },
        selectionSet: ["id", "name"],
      });
      technologies = techData;
    }

    return {
      project,
      technologies,
    };
  } catch (err) {
    console.error("Error fetching project:", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

export default function ProjectDetails({ loaderData }: Route.ComponentProps) {
  const { project, technologies, error } = loaderData || {
    project: null,
    technologies: [],
    error: undefined,
  };
  const navigate = useNavigate();

  const formatDate = (dateString?: string | null) => {
    return dateString ? new Date(dateString).toLocaleDateString() : "-";
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
        <Button onClick={() => navigate("/projects")} variant="outline">
          Back to Projects
        </Button>
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

  const techMap = new Map(technologies.map((tech) => [tech.id, tech.name]));

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate("/projects")}>
            Back to Projects
          </Button>
          <Button onClick={() => navigate(`/projects/${project.id}/edit`)}>
            Edit Project
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Project Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Client</p>
            <p className="text-lg">{project.clientName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Duration</p>
            <p className="text-lg">
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500">Overview</p>
          <p className="text-lg whitespace-pre-wrap">{project.overview}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Technologies</h2>
        {project.technologies.length === 0 ? (
          <p className="text-gray-500">
            No technologies associated with this project.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech.technologyId} variant="secondary">
                {techMap.get(tech.technologyId) || tech.technologyId}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
