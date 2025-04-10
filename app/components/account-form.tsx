import { Form, useNavigation } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import type { Schema } from "../../amplify/data/resource";
import { useState } from "react";
import { MultiSelect } from "./ui/multi-select";

export interface AccountFormProps {
  error?: Error | null;
  onCancel: () => void;
  account?: Pick<
    Schema["Account"]["type"],
    "id" | "name" | "email" | "photo" | "organizationLine" | "residence"
  >; // 既存のアカウント情報（編集時）
  projects?: Pick<Schema["Project"]["type"], "id" | "name">[]; // 利用可能なプロジェクトリスト
  projectAssignments?: Pick<
    Schema["ProjectAssignment"]["type"],
    "projectId" | "startDate" | "endDate"
  >[]; // 現在のプロジェクトアサインメント
}

export function AccountForm({
  error,
  onCancel,
  account,
  projects = [],
  projectAssignments = [],
}: AccountFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">
        {account ? "アカウントを編集" : "新規アカウント"}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error.message}
        </div>
      )}

      <Form method="post">
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name *
          </label>
          <Input
            id="name"
            name="name"
            defaultValue={account?.name || ""}
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={account?.email || ""}
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="photo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Photo URL
          </label>
          <Input
            id="photo"
            name="photo"
            placeholder="https://example.com/photo.jpg"
            defaultValue={account?.photo || ""}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="organizationLine"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Organization Line *
          </label>
          <Input
            id="organizationLine"
            name="organizationLine"
            defaultValue={account?.organizationLine || ""}
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="residence"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Residence *
          </label>
          <Input
            id="residence"
            name="residence"
            defaultValue={account?.residence || ""}
            required
          />
        </div>

        {account && (
          <div className="mb-6 border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-3">
              プロジェクトアサインメント
            </h3>
            <ProjectAssignmentSelector
              projects={projects}
              initialAssignments={projectAssignments}
            />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : account ? "更新する" : "保存する"}
          </Button>
        </div>
      </Form>
    </div>
  );
}

interface ProjectAssignmentSelectorProps {
  projects: Pick<Schema["Project"]["type"], "id" | "name">[];
  initialAssignments: Pick<
    Schema["ProjectAssignment"]["type"],
    "projectId" | "startDate" | "endDate"
  >[];
}

interface Assignment {
  projectId: string;
  startDate: string;
  endDate?: string;
}

function ProjectAssignmentSelector({
  projects,
  initialAssignments,
}: ProjectAssignmentSelectorProps) {
  const formatDateForInput = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const [assignments, setAssignments] = useState<Assignment[]>(
    initialAssignments.map((assignment) => ({
      projectId: assignment.projectId,
      startDate: formatDateForInput(assignment.startDate),
      endDate: formatDateForInput(assignment.endDate),
    })),
  );

  const assignedProjectIds = assignments.map((a) => a.projectId);

  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: project.name,
  }));

  const handleProjectAdd = (projectId: string) => {
    const today = new Date().toISOString().split("T")[0];
    setAssignments([
      ...assignments,
      { projectId, startDate: today, endDate: undefined },
    ]);
  };

  const handleProjectRemove = (projectId: string) => {
    setAssignments(assignments.filter((a) => a.projectId !== projectId));
  };

  const handleDateChange = (
    projectId: string,
    field: "startDate" | "endDate",
    value: string,
  ) => {
    setAssignments(
      assignments.map((a) =>
        a.projectId === projectId ? { ...a, [field]: value } : a,
      ),
    );
  };

  return (
    <div>
      <input
        type="hidden"
        name="projectAssignments"
        value={JSON.stringify(assignments)}
      />

      {/* 未選択プロジェクト選択用セレクター */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          プロジェクトを追加
        </label>
        <MultiSelect
          options={projectOptions.filter(
            (option) => !assignedProjectIds.includes(option.value),
          )}
          selected={[]}
          onChange={(values) => {
            if (values.length > 0) {
              handleProjectAdd(values[0]);
            }
          }}
          placeholder="プロジェクトを選択..."
        />
      </div>

      {/* 選択済みプロジェクトリスト */}
      {assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const project = projects.find((p) => p.id === assignment.projectId);
            const projectName = project?.name || "不明なプロジェクト";
            return (
              <div
                key={assignment.projectId}
                className="border rounded-md p-4 relative"
              >
                <button
                  type="button"
                  onClick={() => handleProjectRemove(assignment.projectId)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
                <h4 className="font-medium mb-2">{projectName}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      開始日 *
                    </label>
                    <Input
                      type="date"
                      value={assignment.startDate}
                      onChange={(e) =>
                        handleDateChange(
                          assignment.projectId,
                          "startDate",
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      終了日
                    </label>
                    <Input
                      type="date"
                      value={assignment.endDate}
                      onChange={(e) =>
                        handleDateChange(
                          assignment.projectId,
                          "endDate",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 italic">プロジェクトが選択されていません</p>
      )}
    </div>
  );
}
