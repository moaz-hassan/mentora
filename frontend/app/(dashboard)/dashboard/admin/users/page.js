"use client";

import { useAdminUsers } from "@/hooks/admin";
import {
  UsersHeader,
  UsersFilterBar,
  UsersTable,
} from "@/components/admin/users";

export default function UsersManagementPage() {
  const {
    users,
    allUsers,
    loading,
    error,
    filters,
    updateFilters,
    handleRoleChange,
    handleStatusToggle,
    refetch,
  } = useAdminUsers();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <UsersHeader totalUsers={allUsers.length} />

      <UsersFilterBar
        search={filters.search}
        roleFilter={filters.role}
        statusFilter={filters.status}
        onSearchChange={(value) => updateFilters({ search: value })}
        onRoleChange={(value) => updateFilters({ role: value })}
        onStatusChange={(value) => updateFilters({ status: value })}
      />

      <UsersTable
        users={users}
        loading={loading}
        onRoleChange={handleRoleChange}
        onStatusToggle={handleStatusToggle}
      />
    </div>
  );
}
