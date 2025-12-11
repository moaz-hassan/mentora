import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getAllUsers, updateUserRole, toggleUserStatus } from "@/lib/apiCalls/admin/users.apiCall";


export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllUsers();

      if (result.success) {
        setUsers(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  
  useEffect(() => {
    let result = [...users];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (user) =>
          user.first_name.toLowerCase().includes(searchLower) ||
          user.last_name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    if (filters.role !== "all") {
      result = result.filter((user) => user.role === filters.role);
    }

    if (filters.status !== "all") {
      const isActive = filters.status === "active";
      result = result.filter((user) => user.is_active === isActive);
    }

    setFilteredUsers(result);
  }, [users, filters]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleRoleChange = useCallback(async (userId, newRole) => {
    try {
      const result = await updateUserRole(userId, newRole);

      if (result.success) {
        toast.success(result.message || "User role updated");
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
      } else {
        throw new Error(result.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error.message);
    }
  }, []);

  const handleStatusToggle = useCallback(async (userId, currentStatus) => {
    try {
      const result = await toggleUserStatus(userId);

      if (result.success) {
        toast.success(result.message || "User status updated");
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, is_active: !currentStatus } : user
          )
        );
      } else {
        throw new Error(result.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message);
    }
  }, []);

  return {
    users: filteredUsers,
    allUsers: users,
    loading,
    error,
    filters,
    updateFilters,
    handleRoleChange,
    handleStatusToggle,
    refetch: fetchUsers,
  };
}
