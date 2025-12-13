export function UsersHeader({ totalUsers }) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
      <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-neutral-400">
        Manage users and their roles. {totalUsers > 0 && `Total: ${totalUsers.toLocaleString()} users`}
      </p>
    </div>
  );
}

