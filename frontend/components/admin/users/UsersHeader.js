export function UsersHeader({ totalUsers }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      <p className="mt-2 text-gray-600">
        Manage users and their roles. {totalUsers > 0 && `Total: ${totalUsers.toLocaleString()} users`}
      </p>
    </div>
  );
}
