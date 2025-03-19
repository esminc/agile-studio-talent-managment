import { Form, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface ProjectTechnologyFormProps {
  error: Error | null;
  onCancel: () => void;
}

export function ProjectTechnologyForm({
  error,
  onCancel,
}: ProjectTechnologyFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Add New Project Technology</h2>

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
            Technology Name *
          </label>
          <Input id="name" name="name" required />
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
            {isSubmitting ? "Saving..." : "Save Technology"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
