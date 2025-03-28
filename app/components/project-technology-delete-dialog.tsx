import { Button } from "~/components/ui/button";

interface ProjectTechnologyDeleteDialogProps {
  projectTechnologyId: string;
}

export function ProjectTechnologyDeleteDialog(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { projectTechnologyId }: ProjectTechnologyDeleteDialogProps,
) {
  return (
    <div>
      <Button variant="destructive" type="submit" form="delete-form">
        Delete
      </Button>
      <form id="delete-form" method="post" className="hidden">
        <input type="hidden" name="action" value="delete" />
      </form>
    </div>
  );
}
