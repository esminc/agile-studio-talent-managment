import * as React from "react";
import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

interface Account {
  id?: string;
  name: string;
  photo?: string;
  organizationLine: string;
  residence: string;
}

interface AccountFormProps {
  onAccountCreated: () => void;
  onCancel: () => void;
}

export function AccountForm({ onAccountCreated, onCancel }: AccountFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    photo: "",
    organizationLine: "",
    residence: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const client = generateClient();

  // Define a more specific return type for the createAccount function
  const createAccount = async (data: Omit<Account, "id">): Promise<Account> => {
    // We need to cast the client to access the models property
    // First cast to unknown, then to the specific type
    return (
      client as unknown as {
        models: {
          Account: {
            create: (data: Omit<Account, "id">) => Promise<Account>;
          };
        };
      }
    ).models.Account.create(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.organizationLine || !formData.residence) {
      setError(
        new Error("Name, Organization Line, and Residence are required"),
      );
      return;
    }

    try {
      setLoading(true);
      await createAccount({
        name: formData.name,
        photo: formData.photo || undefined,
        organizationLine: formData.organizationLine,
        residence: formData.residence,
      });

      setFormData({
        name: "",
        photo: "",
        organizationLine: "",
        residence: "",
      });

      setError(null);
      onAccountCreated();
    } catch (err) {
      console.error("Error creating account:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Add New Account</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
            value={formData.name}
            onChange={handleChange}
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
            value={formData.photo}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
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
            value={formData.organizationLine}
            onChange={handleChange}
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
            value={formData.residence}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Account"}
          </Button>
        </div>
      </form>
    </div>
  );
}
