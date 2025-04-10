// No need to import React with modern JSX transform
import { data, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { client } from "~/lib/amplify-ssr-client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { Route } from "./+types/projects";
import { runWithAmplifyServerContext } from "~/lib/amplifyServerUtils";

export function meta() {
  return [
    { title: "Projects - Agile Studio" },
    { name: "description", content: "Project listing for Agile Studio" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  const { data: projects, errors } = await runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: (contextSpec) => client.models.Project.list(contextSpec),
  });
  return data(
    {
      projects,
      error: errors?.map((e) => e.message).join(", "),
    },
    {
      headers: responseHeaders,
    },
  );
}

export default function Projects({ loaderData }: Route.ComponentProps) {
  const { projects = [], error } = loaderData || {
    projects: [],
    error: undefined,
  };
  const navigate = useNavigate();

  const formatDate = (dateString?: string | null) => {
    return dateString ? new Date(dateString).toLocaleDateString() : "";
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
                <TableCell className="font-medium">
                  <a
                    href={`/projects/${project.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {project.name}
                  </a>
                </TableCell>
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
