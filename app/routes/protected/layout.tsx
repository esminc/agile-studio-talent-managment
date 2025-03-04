import { getCurrentUser } from "aws-amplify/auth";
import { Outlet, redirect } from "react-router";
import { BaseLayout } from "~/components/base-layout";

export async function clientLoader() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return redirect("/login");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return redirect("/login");
  }
  return {};
}

export default function Layout() {
  return (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  );
}
