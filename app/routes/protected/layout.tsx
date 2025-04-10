import { fetchUserAttributes } from "aws-amplify/auth/server";
import { data, Outlet, redirect } from "react-router";
import { BaseLayout } from "~/components/base-layout";
import type { Route } from "./+types/layout";
import { client } from "~/lib/amplify-ssr-client";
import { runWithAmplifyServerContext } from "~/lib/amplifyServerUtils";

export async function loader({ request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  return await runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: async (contextSpec) => {
      try {
        const user = await fetchUserAttributes(contextSpec);
        if (!user) {
          return redirect("/login", {
            headers: responseHeaders,
          });
        }
        const { data: accounts, errors } = await client.models.Account.list(
          contextSpec,
          {
            filter: { email: { eq: user.email } },
          },
        );
        return data(
          {
            account: accounts?.[0],
            error: errors?.map((error) => error.message)?.join(", "),
          },
          {
            headers: responseHeaders,
          },
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        return redirect("/login", {
          headers: responseHeaders,
        });
      }
    },
  });
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { account } = loaderData;
  return (
    <BaseLayout account={account}>
      <Outlet />
    </BaseLayout>
  );
}
