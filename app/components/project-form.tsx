import { Form, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import type { Schema } from "../../amplify/data/resource";

interface ProjectFormProps {
  error: Error | null;
  onCancel: () => void;
  project?: Schema["Project"]["type"] | null;
}

export function ProjectForm({ error, onCancel, project }: ProjectFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!project;

  const formatDateForInput = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? "Edit Project" : "Add New Project"}
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
            Project Name *
          </label>
          <Input
            id="name"
            name="name"
            defaultValue={project?.name || ""}
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="clientName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Client Name *
          </label>
          <Input
            id="clientName"
            name="clientName"
            defaultValue={project?.clientName || ""}
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="overview"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Overview *
          </label>
          <textarea
            id="overview"
            name="overview"
            defaultValue={project?.overview || ""}
            required
            className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date *
          </label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={formatDateForInput(project?.startDate)}
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Date
          </label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={formatDateForInput(project?.endDate)}
          />
        </div>

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
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Update Project"
                : "Save Project"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
