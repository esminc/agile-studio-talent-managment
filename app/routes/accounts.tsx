// No need to import React with modern JSX transform
import { Button } from "../components/ui/button";
import { AccountCard } from "../components/account-card";
import { client } from "../lib/amplify-ssr-client";
import { useNavigate } from "react-router";
import { parse } from "csv-parse/browser/esm";
import { CSVImportDialog } from "../components/csv-import-dialog";
import type { Route } from "./+types/accounts";
import { runWithAmplifyServerContext } from "~/lib/amplifyServerUtils";

export function meta() {
  return [
    { title: "Accounts - Agile Studio" },
    { name: "description", content: "Account listing for Agile Studio" },
  ];
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const csvFile = formData.get("csvFile") as File;

  if (!csvFile) {
    return { error: "CSVファイルが必要です" };
  }

  try {
    const text = await csvFile.text();
    const parseCSV = () => {
      return new Promise<Array<Record<string, string>>>((resolve, reject) => {
        parse(
          text,
          {
            columns: true,
            skip_empty_lines: true,
            trim: true,
          },
          (err, records) => {
            if (err) {
              reject(err);
            } else {
              resolve(records);
            }
          },
        );
      });
    };

    const records = await parseCSV();

    const results = {
      success: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      if (
        !record.name ||
        !record.email ||
        !record.organizationLine ||
        !record.residence
      ) {
        results.errors.push(
          `行 ${i + 1}: 名前、メール、組織、居住地は必須です`,
        );
        continue;
      }

      const responseHeaders = new Headers();
      await runWithAmplifyServerContext({
        serverContext: { request, responseHeaders },
        operation: async (contextSpec) => {
          try {
            const { errors } = await client.models.Account.create(contextSpec, {
              name: record.name,
              email: record.email,
              photo: record.photo || undefined,
              organizationLine: record.organizationLine,
              residence: record.residence,
            });

            if (errors) {
              results.errors.push(
                `行 ${i + 1}: ${errors.map((err) => err.message).join(", ")}`,
              );
            } else {
              results.success++;
            }
          } catch (error) {
            results.errors.push(
              `行 ${i + 1}: ${error instanceof Error ? error.message : "不明なエラー"}`,
            );
          }
        },
      });
    }

    return {
      results,
    };
  } catch (error) {
    return {
      error: `CSVの処理中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
    };
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  return runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: async (contextSpec) => {
      try {
        const { data } = await client.models.Account.list(contextSpec);
        return { accounts: data };
      } catch (err) {
        console.error("Error fetching accounts:", err);
        return {
          accounts: [],
          error: err instanceof Error ? err.message : "Unknown error occurred",
        };
      }
    },
  });
}

export default function Accounts({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const handleAccountClick = (accountId: string) => {
    navigate(`/accounts/${accountId}`);
  };

  const { accounts, error } = loaderData;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <div className="flex gap-2">
          <CSVImportDialog
            title="アカウントインポート"
            description="CSVファイルからアカウントをインポートします。"
            headers={[
              { name: "name", required: true },
              { name: "email", required: true },
              { name: "photo", required: false },
              { name: "organizationLine", required: true },
              { name: "residence", required: true },
            ]}
          />
          <Button onClick={() => navigate("/accounts/new")}>Add Account</Button>
        </div>
      </div>

      {loaderData.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          エラー: {loaderData.error}
        </div>
      )}

      {actionData?.results && (
        <div
          className={`px-4 py-3 rounded mb-4 ${actionData?.results?.errors.length ? "bg-yellow-100 border border-yellow-400 text-yellow-700" : "bg-green-100 border border-green-400 text-green-700"}`}
        >
          <p>
            {actionData.results.success}
            件のアカウントが正常にインポートされました。
          </p>
          {actionData?.results?.errors.length && (
            <>
              <p className="font-bold mt-2">
                {actionData.results.errors.length}件のエラーがありました:
              </p>
              <ul className="list-disc pl-5 mt-1">
                {actionData?.results?.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error.toString()}
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No accounts found. Add an account to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onClick={() => handleAccountClick(account.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
