// No need to import React with modern JSX transform
import { useNavigate } from "react-router";
import type { Schema } from "../../amplify/data/resource";
import { Button } from "../components/ui/button";
import { client } from "../lib/amplify-client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export function meta() {
  return [
    { title: "Project Technologies - Agile Studio" },
    {
      name: "description",
      content: "Project Technology listing for Agile Studio",
    },
  ];
}

type ProjectTechnology = Schema["ProjectTechnology"]["type"];

export async function clientLoader() {
  try {
    const { data } = await client.models.ProjectTechnology.list({
      selectionSet: [
        "id",
        "name",
        "projects.id",
        "projects.project.id",
        "projects.project.name",
      ],
    });
    return { projectTechnologies: data };
  } catch (err) {
    console.error("Error fetching project technologies:", err);
    return {
      projectTechnologies: [],
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

interface LoaderData {
  projectTechnologies: ProjectTechnology[];
  error?: string;
}

export default function ProjectTechnologies({
  loaderData,
}: {
  loaderData: LoaderData | undefined;
}) {
  const { projectTechnologies = [], error } = loaderData || {
    projectTechnologies: [],
    error: undefined,
  };
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Project Technologies</h1>
        <Button onClick={() => navigate("/project-technologies/new")}>
          Add Project Technology
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {projectTechnologies.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No project technologies found. Add a project technology to get
            started.
          </p>
        </div>
      ) : (
        <Table>
          <TableCaption>A list of all project technologies.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Projects Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectTechnologies.map((technology: ProjectTechnology) => (
              <TableRow key={technology.id}>
                <TableCell className="font-medium">{technology.name}</TableCell>
                <TableCell>
                  {
                    Object.values(technology.projects || {}).filter(
                      (link) => link?.project?.id,
                    ).length
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
