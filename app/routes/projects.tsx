// No need to import React with modern JSX transform
import { useLoaderData, useNavigate } from "react-router";
import type { Schema } from "../../amplify/data/resource";
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

export function meta() {
  return [
    { title: "Projects - Agile Studio" },
    { name: "description", content: "Project listing for Agile Studio" },
  ];
}

type Project = Schema["Project"]["type"];

interface LoaderData {
  projects: Project[];
  error?: string;
}

export async function clientLoader() {
  try {
    const { data } = await client.models.Project.list();
    return { projects: data };
  } catch (err) {
    console.error("Error fetching projects:", err);
    return {
      projects: [],
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

export default function Projects() {
  const { projects, error } = useLoaderData() as LoaderData;
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => navigate("/projects/new")}>Add Project</Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No projects found. Add a project to get started.
          </p>
        </div>
      ) : (
        <Table>
          <TableCaption>A list of all projects.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Overview</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.clientName}</TableCell>
                <TableCell>{project.overview}</TableCell>
                <TableCell>{formatDate(project.startDate)}</TableCell>
                <TableCell>{formatDate(project.endDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
