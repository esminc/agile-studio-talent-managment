// No need to import React with modern JSX transform
import { useState, useEffect } from "react";
import type { Schema } from "../../amplify/data/resource";
import { Button } from "../components/ui/button";
import { AccountCard } from "../components/account-card";
import { client } from "../lib/amplify-client";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { parse } from "csv-parse/browser/esm";
import { CSVImportForm } from "../components/csv-import-form";

export function meta() {
  return [
    { title: "Accounts - Agile Studio" },
    { name: "description", content: "Account listing for Agile Studio" },
  ];
}

type Account = Schema["Account"]["type"];

export async function clientAction({ request }: { request: Request }) {
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

      try {
        const { errors } = await client.models.Account.create({
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

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleAccountClick = (accountId: string) => {
    navigate(`/accounts/${accountId}`);
  };
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data } = await client.models.Account.list();
      setAccounts(data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // handleAccountCreated removed as it's no longer needed

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">CSVからインポート</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>CSVからアカウントをインポート</DialogTitle>
              </DialogHeader>
              <CSVImportForm
                onSuccess={(results) => {
                  setImportResults(results);
                  setImportError(null);
                  fetchAccounts(); // 成功したら一覧を更新
                }}
                onError={(error) => {
                  setImportError(error);
                  setImportResults(null);
                }}
              />
            </DialogContent>
          </Dialog>
          <Button onClick={() => navigate("/accounts/new")}>Add Account</Button>
        </div>
      </div>

      {importError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          エラー: {importError}
        </div>
      )}

      {importResults && (
        <div
          className={`px-4 py-3 rounded mb-4 ${importResults.errors.length > 0 ? "bg-yellow-100 border border-yellow-400 text-yellow-700" : "bg-green-100 border border-green-400 text-green-700"}`}
        >
          <p>
            {importResults.success}件のアカウントが正常にインポートされました。
          </p>
          {importResults.errors.length > 0 && (
            <>
              <p className="font-bold mt-2">
                {importResults.errors.length}件のエラーがありました:
              </p>
              <ul className="list-disc pl-5 mt-1">
                {importResults.errors.map((err, idx) => (
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-48 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
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
