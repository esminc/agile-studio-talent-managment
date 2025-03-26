import type { Schema } from "amplify/data/resource";
import { client } from "./amplify-client";

export async function updateProjectTechnologyLinks({
  project,
  projectTechnologyIds,
}: {
  project: Pick<Schema["Project"]["type"], "id"> & {
    technologies: Pick<
      Schema["ProjectTechnologyLink"]["type"],
      "id" | "technologyId"
    >[];
  };
  projectTechnologyIds: string[];
}) {
  const currentTechIds =
    project.technologies.map((tech) => tech.technologyId) ?? [];

  const linksToRemove =
    project?.technologies.filter(
      (link) => !projectTechnologyIds.includes(link.technologyId),
    ) ?? [];
  for (const linkToRemove of linksToRemove) {
    await client.models.ProjectTechnologyLink.delete({
      id: linkToRemove.id,
    });
  }

  const techToAdd = projectTechnologyIds.filter(
    (id) => !currentTechIds.includes(id),
  );
  for (const techId of techToAdd) {
    await client.models.ProjectTechnologyLink.create({
      projectId: project.id,
      technologyId: techId,
    });
  }
}
