import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

// Define Account interface based on the schema in amplify/data/resource.ts
interface Account {
  id: string;
  name: string;
  photo?: string;
  organizationLine: string;
  residence: string;
}

export function meta() {
  return [
    { title: "Accounts - Agile Studio Talent Management" },
    { name: "description", content: "Account list page" },
  ];
}

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        // In a real implementation, we would use the Amplify client to fetch accounts
        // const client = generateClient<Schema>();
        // const { data } = await client.models.Account.list({});

        // For now, use mock data to demonstrate the UI
        const mockAccounts: Account[] = [
          {
            id: "1",
            name: "山田 太郎",
            photo: "https://randomuser.me/api/portraits/men/1.jpg",
            organizationLine: "開発部",
            residence: "東京",
          },
          {
            id: "2",
            name: "佐藤 花子",
            photo: "https://randomuser.me/api/portraits/women/1.jpg",
            organizationLine: "デザイン部",
            residence: "大阪",
          },
          {
            id: "3",
            name: "鈴木 一郎",
            organizationLine: "マーケティング部",
            residence: "福岡",
          },
          {
            id: "4",
            name: "高橋 美咲",
            photo: "https://randomuser.me/api/portraits/women/2.jpg",
            organizationLine: "営業部",
            residence: "名古屋",
          },
          {
            id: "5",
            name: "田中 健太",
            photo: "https://randomuser.me/api/portraits/men/2.jpg",
            organizationLine: "人事部",
            residence: "札幌",
          },
          {
            id: "6",
            name: "伊藤 直子",
            organizationLine: "経理部",
            residence: "仙台",
          },
        ];

        setAccounts(mockAccounts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError("アカウント情報の取得中にエラーが発生しました。");
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">アカウント一覧</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {accounts.map((account) => (
          <Card key={account.id} className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{account.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {account.photo ? (
                <div className="aspect-square overflow-hidden">
                  <img
                    src={account.photo}
                    alt={`${account.name}の写真`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Photo</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && (
        <p className="text-center mt-8">アカウントが見つかりませんでした。</p>
      )}
    </main>
  );
}
