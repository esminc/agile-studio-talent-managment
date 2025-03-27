import { Form, useNavigation } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import type { Schema } from "../../amplify/data/resource";

export interface AccountFormProps {
  error?: Error | null;
  onCancel: () => void;
  account?: Schema["Account"]["type"]; // 既存のアカウント情報（編集時）
}

export function AccountForm({ error, onCancel, account }: AccountFormProps) {
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
