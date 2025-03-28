import { Link, redirect } from "react-router";
import { Button } from "~/components/ui/button";
import { client } from "~/lib/amplify-client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ProjectTechnologyDeleteDialog } from "~/components/project-technology-delete-dialog";
import type { Route } from "./+types/index";

export function meta() {
  return [
    { title: "Project Technology Details - Agile Studio" },
    {
      name: "description",
      content: "View project technology details for Agile Studio",
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
          selectionSet: [
            "id",
            "name",
            "description",
            "projects.*",
            "projects.project.*",
          ],
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

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const action = formData.get("action") as string;
  const projectTechnologyId = formData.get("projectTechnologyId") as string;
  if (action === "delete") {
    try {
      await client.models.ProjectTechnology.delete({
        id: projectTechnologyId,
      });
      return redirect("/project-technologies");
    } catch (err) {
      console.error("Error deleting project technology:", err);
      return {
        error: err instanceof Error ? err.message : "Unknown error occurred",
      };
    }
  }

  return { error: "Invalid action" };
}

export default function ProjectTechnologyDetails({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { projectTechnology, error } = loaderData || {
    projectTechnology: null,
    error: undefined,
  };

  const { error: actionError } = actionData || {
    error: undefined,
  };

  if (error || actionError) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error || actionError}
        </div>
        <Link
          to="/project-technologies"
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Back to Project Technologies
        </Link>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Project Technology Details</h1>
        <div className="space-x-2">
          <Button variant="outline">
            <Link to="/project-technologies">Back to List</Link>
          </Button>
          <Button>
            <Link to={`/project-technologies/${projectTechnology.id}/edit`}>
              Edit
            </Link>
          </Button>
          <ProjectTechnologyDeleteDialog
            projectTechnologyId={projectTechnology.id}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Technology Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{projectTechnology.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">
                {projectTechnology.description || "No description provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Related Projects</h2>
        {projectTechnology.projects && projectTechnology.projects.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Projects using this technology</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectTechnology.projects.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/projects/${link.project.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {link.project.name}
                      </Link>
                    </TableCell>
                    <TableCell>{link.project.clientName}</TableCell>
                    <TableCell>
                      {new Date(link.project.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {link.project.endDate
                        ? new Date(link.project.endDate).toLocaleDateString()
                        : "Ongoing"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-gray-500">
            No projects are using this technology yet.
          </p>
        )}
      </div>
    </div>
  );
}
