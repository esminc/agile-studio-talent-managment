import type { Schema } from "../../amplify/data/resource";
import { client } from "./amplify-client";

export async function updateProjectAssignments({
  account,
  projectAssignments,
}: {
  account: Pick<Schema["Account"]["type"], "id"> & {
    assignments?:
      | Pick<
          Schema["ProjectAssignment"]["type"],
          "id" | "projectId" | "startDate" | "endDate"
        >[]
      | null;
  };
  projectAssignments: {
    projectId: string;
    startDate: string;
    endDate?: string;
  }[];
}) {
  const currentAssignments = account.assignments || [];

  const assignmentsToRemove = currentAssignments.filter(
    (assignment) =>
      !projectAssignments.some((pa) => pa.projectId === assignment.projectId),
  );

  for (const assignmentToRemove of assignmentsToRemove) {
    await client.models.ProjectAssignment.delete({
      id: assignmentToRemove.id,
    });
  }

  // const currentProjectIds = currentAssignments.map(
  //   (assignment) => assignment.projectId,
  // );

  for (const pa of projectAssignments) {
    const existingAssignment = currentAssignments.find(
      (a) => a.projectId === pa.projectId,
    );

    if (existingAssignment) {
      if (
        existingAssignment.startDate !== pa.startDate ||
        existingAssignment.endDate !== pa.endDate
      ) {
        await client.models.ProjectAssignment.update({
          id: existingAssignment.id,
          startDate: pa.startDate,
          endDate: pa.endDate || undefined,
        });
      }
    } else {
      await client.models.ProjectAssignment.create({
        accountId: account.id,
        projectId: pa.projectId,
        startDate: pa.startDate,
        endDate: pa.endDate || undefined,
      });
    }
  }
}
