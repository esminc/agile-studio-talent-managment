// No need to import React with modern JSX transform
import { useNavigate } from "react-router";
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
import type { Route } from "./+types/project-technologies";

export function meta() {
  return [
    { title: "Project Technologies - Agile Studio" },
    {
      name: "description",
      content: "Project Technology listing for Agile Studio",
    },
  ];
}

export async function clientLoader() {
  try {
    const { data } = await client.models.ProjectTechnology.list({
      selectionSet: ["id", "name", "description", "projects.*"],
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

export default function ProjectTechnologies({
  loaderData,
}: Route.ComponentProps) {
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
              <TableHead>Description</TableHead>
              <TableHead>Projects Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectTechnologies.map((technology) => (
              <TableRow key={technology.id}>
                <TableCell className="font-medium">
                  <button
                    onClick={() =>
                      navigate(`/project-technologies/${technology.id}/edit`)
                    }
                    className="hover:underline text-blue-600"
                  >
                    {technology.name}
                  </button>
                </TableCell>
                <TableCell>{technology.description}</TableCell>
                <TableCell>{technology.projects.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
