export function UserRow({ user, onRoleChange, onStatusToggle }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
      <td className="px-4 py-4 whitespace-nowrap sm:px-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
            {user.first_name[0]}
          </div>
          <div className="ml-3 sm:ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-sm text-gray-500 dark:text-neutral-400 truncate max-w-[150px] sm:max-w-none">{user.email}</div>
            {/* Mobile: show role and status inline */}
            <div className="flex items-center gap-2 mt-1 sm:hidden">
              <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                user.role === "admin"
                  ? "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300"
                  : user.role === "instructor"
                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                  : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
              }`}>
                {user.role}
              </span>
              <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                user.is_active !== false
                  ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                  : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
              }`}>
                {user.is_active !== false ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap sm:px-6">
        <select
          value={user.role}
          onChange={(e) => onRoleChange(e.target.value)}
          className={`text-xs font-semibold rounded-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
            user.role === "admin"
              ? "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300"
              : user.role === "instructor"
              ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
              : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
          }`}
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap sm:px-6">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            user.is_active !== false
              ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
          }`}
        >
          {user.is_active !== false ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="hidden lg:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400 sm:px-6">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium sm:px-6">
        <button
          onClick={onStatusToggle}
          className={`text-xs sm:text-sm ${
            user.is_active !== false
              ? "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
          }`}
        >
          {user.is_active !== false ? "Deactivate" : "Activate"}
        </button>
      </td>
    </tr>
  );
}

