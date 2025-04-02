// No need to import React with modern JSX transform
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { client } from "../lib/amplify-client";
import { parse } from "csv-parse/browser/esm";
import { CSVImportDialog } from "../components/csv-import-dialog";
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

export async function clientAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const csvFile = formData.get("csvFile") as File;

  if (!csvFile) {
    return { error: "CSVファイルが必要です" };
  }

  try {
    const text = await csvFile.text();
    const parseCSV = () => {
      return new Promise<Array<Record<string, string>>>((resolve, reject) => {
        parse(
          text,
          {
            columns: true,
            skip_empty_lines: true,
            trim: true,
          },
          (err, records) => {
            if (err) {
              reject(err);
            } else {
              resolve(records);
            }
          },
        );
      });
    };

    const records = await parseCSV();

    const results = {
      success: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      if (!record.name) {
        results.errors.push(`行 ${i + 1}: 名前は必須です`);
        continue;
      }

      try {
        const { data: existingTech } =
          await client.models.ProjectTechnology.listProjectTechnologyByName({
            name: record.name,
          });

        if (existingTech.length > 0) {
          const { errors } = await client.models.ProjectTechnology.update({
            id: existingTech[0].id,
            name: record.name,
            description: record.description || existingTech[0].description,
          });

          if (errors) {
            results.errors.push(
              `行 ${i + 1}: ${errors.map((err) => err.message).join(", ")}`,
            );
          } else {
            results.success++;
          }
        } else {
          const { errors } = await client.models.ProjectTechnology.create({
            name: record.name,
            description: record.description || undefined,
          });

          if (errors) {
            results.errors.push(
              `行 ${i + 1}: ${errors.map((err) => err.message).join(", ")}`,
            );
          } else {
            results.success++;
          }
        }
      } catch (error) {
        results.errors.push(
          `行 ${i + 1}: ${error instanceof Error ? error.message : "不明なエラー"}`,
        );
      }
    }

    return {
      results,
    };
  } catch (error) {
    return {
      error: `CSVの処理中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
    };
  }
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
  actionData,
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
        <div className="flex gap-2">
          <CSVImportDialog
            title="プロジェクト技術インポート"
            description="CSVファイルからプロジェクト技術をインポートします。"
            headers={[
              { name: "name", required: true },
              { name: "description", required: false },
            ]}
            maxProgressValue={100}
          />
          <Button onClick={() => navigate("/project-technologies/new")}>
            Add Project Technology
          </Button>
        </div>
      </div>

      {actionData?.results && (
        <div
          className={`px-4 py-3 rounded mb-4 ${actionData?.results?.errors.length ? "bg-yellow-100 border border-yellow-400 text-yellow-700" : "bg-green-100 border border-green-400 text-green-700"}`}
        >
          <p>
            {actionData.results.success}
            件のプロジェクト技術が正常にインポートされました。
          </p>
          {actionData?.results?.errors.length > 0 && (
            <>
              <p className="font-bold mt-2">
                {actionData.results.errors.length}件のエラーがありました:
              </p>
              <ul className="list-disc pl-5 mt-1">
                {actionData.results.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          エラー: {actionData.error}
        </div>
      )}

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
                      navigate(`/project-technologies/${technology.id}`)
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
