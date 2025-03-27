import { useNavigate } from "react-router";
import { client } from "~/lib/amplify-client";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/index";

export function meta() {
  return [
    { title: "Account Details - Agile Studio" },
    { name: "description", content: "Account details for Agile Studio" },
  ];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    const accountId = params.accountId;
    const { data: account } = await client.models.Account.get(
      {
        id: accountId,
      },
      {
        selectionSet: [
          "id",
          "name",
          "email",
          "photo",
          "organizationLine",
          "residence",
          "assignments.id",
          "assignments.projectId",
          "assignments.startDate",
          "assignments.endDate",
          "assignments.project.id",
          "assignments.project.name",
          "assignments.project.clientName",
        ],
      },
    );

    if (!account) {
      return { error: "Account not found" };
    }

    return {
      account,
    };
  } catch (err) {
    console.error("Error fetching account:", err);
    return {
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

export default function AccountDetails({ loaderData }: Route.ComponentProps) {
  const { account, error } = loaderData || {
    account: null,
    error: undefined,
  };
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
        <Button onClick={() => navigate("/accounts")} variant="outline">
          アカウント一覧に戻る
        </Button>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{account.name}</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate("/accounts")}>
            アカウント一覧に戻る
          </Button>
          <Button onClick={() => navigate(`/accounts/${account.id}/edit`)}>
            アカウントを編集
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">アカウント詳細</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {account.photo && (
            <div className="col-span-full mb-4">
              <div className="h-60 w-60 mx-auto overflow-hidden rounded-lg">
                <img
                  src={account.photo}
                  alt={`${account.name}のプロフィール写真`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gray-500">名前</p>
            <p className="text-lg">{account.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">メールアドレス</p>
            <p className="text-lg">{account.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">組織</p>
            <p className="text-lg">{account.organizationLine}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">居住地</p>
            <p className="text-lg">{account.residence}</p>
          </div>
        </div>
      </div>

      {account.assignments && account.assignments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">プロジェクトアサインメント</h2>
          <div className="space-y-3">
            {account.assignments.map((assignment) => {
              const startDate = new Date(
                assignment.startDate,
              ).toLocaleDateString("ja-JP");

              const endDateDisplay = assignment.endDate
                ? new Date(assignment.endDate).toLocaleDateString("ja-JP")
                : "設定なし";

              return (
                <div
                  key={assignment.id}
                  className="border-b pb-3 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {assignment.project?.name || "不明なプロジェクト"}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {assignment.project?.clientName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        <span className="text-gray-500">期間: </span>
                        {startDate}{" "}
                        {assignment.endDate ? `〜 ${endDateDisplay}` : "から"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
