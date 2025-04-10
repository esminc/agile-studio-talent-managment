import { redirect, useFetcher, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { client } from "~/lib/amplify-ssr-client";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { useToast } from "~/components/ui/use-toast";
import type { Route } from "./+types/index";
import type { Schema } from "amplify/data/resource";
import { runWithAmplifyServerContext } from "~/lib/amplifyServerUtils";

type ProjectTechnology = Pick<
  Schema["ProjectTechnology"]["type"],
  "id" | "name"
>;

export function meta() {
  return [
    { title: "Project Details - Agile Studio" },
    { name: "description", content: "Project details for Agile Studio" },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  return runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: async (contextSpec) => {
      try {
        const projectId = params.projectId;

        const { data: project } = await client.models.Project.get(
          contextSpec,
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
              "assignments.id",
              "assignments.accountId",
              "assignments.startDate",
              "assignments.endDate",
              "assignments.account.id",
              "assignments.account.name",
              "assignments.account.email",
              "assignments.account.photo",
              "assignments.account.organizationLine",
              "assignments.account.residence",
            ],
          },
        );

        if (!project) {
          return { error: "Project not found" };
        }

        const techIds = project.technologies.map((tech) => tech.technologyId);
        let technologies: ProjectTechnology[] = [];

        if (techIds.length > 0) {
          const { data: techData } = await client.models.ProjectTechnology.list(
            contextSpec,
            {
              filter: { or: techIds.map((techId) => ({ id: { eq: techId } })) },
              selectionSet: ["id", "name"],
            },
          );
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
    },
  });
}

export async function action({ params, request }: Route.ActionArgs) {
  const responseHeaders = new Headers();
  return runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: async (contextSpec) => {
      try {
        const projectId = params.projectId;

        const { data: project } = await client.models.Project.get(
          contextSpec,
          {
            id: projectId,
          },
          {
            selectionSet: ["id", "technologies.*", "assignments.*"],
          },
        );

        if (!project) {
          return { error: "Project not found" };
        }

        if (project.assignments && project.assignments.length > 0) {
          for (const assignment of project.assignments) {
            await client.models.ProjectAssignment.delete(contextSpec, {
              id: assignment.id,
            });
          }
        }

        for (const techLink of project.technologies) {
          await client.models.ProjectTechnologyLink.delete(contextSpec, {
            id: techLink.id,
          });
        }

        await client.models.Project.delete(contextSpec, {
          id: projectId,
        });

        return redirect("/projects");
      } catch (err) {
        console.error("Error deleting project:", err);
        return {
          error: err instanceof Error ? err.message : "Unknown error occurred",
        };
      }
    },
  });
}

export default function ProjectDetails({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { project, technologies, error } = loaderData || {
    project: null,
    technologies: [],
    error: undefined,
  };
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { error: deleteError } = actionData || {
    error: undefined,
  };
  const { toast } = useToast();

  const formatDate = (dateString?: string | null) => {
    return dateString ? new Date(dateString).toLocaleDateString() : "-";
  };

  useEffect(() => {
    if (deleteError) {
      toast({
        variant: "destructive",
        title: "削除エラー",
        description: deleteError,
      });
    }
  }, [deleteError, toast]);

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
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            削除
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

      {/* アサイン済みアカウントセクション */}
      {project.assignments && project.assignments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">アサイン済みアカウント</h2>
          <div className="space-y-4">
            {project.assignments.map((assignment) => {
              const startDate = formatDate(assignment.startDate);
              const endDate = formatDate(assignment.endDate);
              const account = assignment.account;

              return (
                <div
                  key={assignment.id}
                  className="border-b pb-4 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/accounts/${account.id}`)}
                >
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 mr-3 overflow-hidden">
                        {account.photo ? (
                          <img
                            src={account.photo}
                            alt={`${account.name}の写真`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white">
                            {account.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{account.name}</h3>
                        <p className="text-sm text-gray-600">
                          {account.organizationLine}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2 md:mt-0 md:self-center">
                      {startDate} {endDate !== "-" ? `〜 ${endDate}` : "から"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>プロジェクトを削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は元に戻せません。このプロジェクトとそれに関連するすべての技術リンクとアサインメントが削除されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              キャンセル
            </Button>
            <fetcher.Form method="delete">
              <Button type="submit" variant="destructive">
                削除する
              </Button>
            </fetcher.Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
