import { fetchUserAttributes } from "aws-amplify/auth";
import { Outlet, redirect } from "react-router";
import { BaseLayout } from "~/components/base-layout";
import type { Route } from "./+types/layout";
import { client } from "~/lib/amplify-client";

export async function clientLoader() {
  try {
    const user = await fetchUserAttributes();
    if (!user) {
      return redirect("/login");
    }
    const { data: accounts, errors } = await client.models.Account.list({
      filter: { email: { eq: user.email } },
    });
    return {
      account: accounts?.[0],
      error: errors?.map((error) => error.message)?.join(", "),
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return redirect("/login");
  }
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { account } = loaderData;
  return (
    <BaseLayout account={account}>
      <Outlet />
    </BaseLayout>
  );
}
