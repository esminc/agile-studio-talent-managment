// No need to import React with modern JSX transform
import { useState, useEffect } from "react";
import type { Schema } from "../../amplify/data/resource";
import { Button } from "../components/ui/button";
import { AccountCard } from "../components/account-card";
import { client } from "../lib/amplify-client";
import { useNavigate } from "react-router";

export function meta() {
  return [
    { title: "Accounts - Agile Studio" },
    { name: "description", content: "Account listing for Agile Studio" },
  ];
}

type Account = Schema["Account"]["type"];

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
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
        <Button onClick={() => navigate("/accounts/new")}>Add Account</Button>
      </div>

      {/* Inline form removed */}

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
