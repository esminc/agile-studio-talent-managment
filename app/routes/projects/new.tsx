// No need to import React with modern JSX transform
import { useNavigate } from "react-router";
import { ProjectForm } from "~/components/project-form";

export function meta() {
  return [
    { title: "New Project - Agile Studio" },
    { name: "description", content: "Create a new project for Agile Studio" },
  ];
}

export default function NewProject() {
  const navigate = useNavigate();

  const handleProjectCreated = () => {
    navigate("/projects");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>
      <ProjectForm
        onProjectCreated={handleProjectCreated}
        onCancel={() => navigate("/projects")}
      />
    </div>
  );
}
