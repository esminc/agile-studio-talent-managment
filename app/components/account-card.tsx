// No need to import React with modern JSX transform

interface Account {
  id?: string;
  name: string;
  photo?: string;
  organizationLine: string;
  residence: string;
}

interface AccountCardProps {
  account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-40 bg-gray-200 flex items-center justify-center">
        {account.photo ? (
          <img
            src={account.photo}
            alt={`${account.name}'s photo`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center text-white text-2xl">
            {account.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{account.name}</h3>
        <p className="text-sm text-gray-600 mb-1">{account.organizationLine}</p>
        <p className="text-sm text-gray-500">{account.residence}</p>
      </div>
    </div>
  );
}
