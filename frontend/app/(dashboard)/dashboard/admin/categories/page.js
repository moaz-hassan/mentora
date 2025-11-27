"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { categoriesAPI, subcategoriesAPI } from "@/lib/apiCalls/admin/categories.apiCall";

export default function CategoryManagementPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Subcategory dialog states
  const [createSubDialogOpen, setCreateSubDialogOpen] = useState(false);
  const [editSubDialogOpen, setEditSubDialogOpen] = useState(false);
  const [deleteSubDialogOpen, setDeleteSubDialogOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [parentCategoryForSub, setParentCategoryForSub] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({ name: "" });
  const [subFormData, setSubFormData] = useState({ name: "", category_id: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoriesAPI.getAll();
      console.log(res);
      if (res.success) {
        setCategories(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    toast.success("Categories refreshed");
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError("Category name is required");
      return false;
    }
    if (formData.name.trim().length < 2) {
      setFormError("Category name must be at least 2 characters");
      return false;
    }
    setFormError("");
    return true;
  };

  const validateSubForm = () => {
    if (!subFormData.name.trim()) {
      setFormError("Subcategory name is required");
      return false;
    }
    if (subFormData.name.trim().length < 2) {
      setFormError("Subcategory name must be at least 2 characters");
      return false;
    }
    if (!subFormData.category_id) {
      setFormError("Please select a parent category");
      return false;
    }
    setFormError("");
    return true;
  };

  // Category CRUD handlers
  const handleCreate = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const res = await categoriesAPI.create({ name: formData.name.trim() });
      if (res.success) {
        toast.success("Category created successfully");
        setCreateDialogOpen(false);
        setFormData({ name: "" });
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const res = await categoriesAPI.update(selectedCategory.id, {
        name: formData.name.trim(),
      });
      if (res.success) {
        toast.success("Category updated successfully");
        setEditDialogOpen(false);
        setSelectedCategory(null);
        setFormData({ name: "" });
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    setSaving(true);
    try {
      const res = await categoriesAPI.delete(selectedCategory.id);
      if (res.success) {
        toast.success("Category deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete category");
    } finally {
      setSaving(false);
    }
  };


  // Subcategory CRUD handlers
  const handleCreateSubcategory = async () => {
    if (!validateSubForm()) return;

    setSaving(true);
    try {
      const res = await subcategoriesAPI.create({
        name: subFormData.name.trim(),
        category_id: subFormData.category_id,
      });
      if (res.success) {
        toast.success("Subcategory created successfully");
        setCreateSubDialogOpen(false);
        setSubFormData({ name: "", category_id: "" });
        setParentCategoryForSub(null);
        fetchCategories();
        // Expand the parent category to show the new subcategory
        setExpandedCategories(prev => ({
          ...prev,
          [subFormData.category_id]: true
        }));
      }
    } catch (error) {
      toast.error(error.message || "Failed to create subcategory");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubcategory = async () => {
    if (!subFormData.name.trim()) {
      setFormError("Subcategory name is required");
      return;
    }

    setSaving(true);
    try {
      const res = await subcategoriesAPI.update(selectedSubcategory.id, {
        name: subFormData.name.trim(),
      });
      if (res.success) {
        toast.success("Subcategory updated successfully");
        setEditSubDialogOpen(false);
        setSelectedSubcategory(null);
        setSubFormData({ name: "", category_id: "" });
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update subcategory");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!selectedSubcategory) return;

    setSaving(true);
    try {
      const res = await subcategoriesAPI.delete(selectedSubcategory.id);
      if (res.success) {
        toast.success("Subcategory deleted successfully");
        setDeleteSubDialogOpen(false);
        setSelectedSubcategory(null);
        fetchCategories();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete subcategory");
    } finally {
      setSaving(false);
    }
  };

  // Dialog openers
  const openEditDialog = (category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name });
    setFormError("");
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const openCreateSubDialog = (category = null) => {
    setParentCategoryForSub(category);
    setSubFormData({ 
      name: "", 
      category_id: category?.id || "" 
    });
    setFormError("");
    setCreateSubDialogOpen(true);
  };

  const openEditSubDialog = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setSubFormData({ name: subcategory.name, category_id: subcategory.category_id });
    setFormError("");
    setEditSubDialogOpen(true);
  };

  const openDeleteSubDialog = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setDeleteSubDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }


  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground mt-1">
            Organize courses with categories and subcategories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" onClick={() => openCreateSubDialog()}>
            <Layers className="h-4 w-4 mr-2" />
            Add Subcategory
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
                <DialogDescription>
                  Add a new category to organize courses
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter category name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ name: e.target.value });
                      setFormError("");
                    }}
                  />
                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            {categories.length} categories total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No categories found. Create your first category to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <Collapsible
                  key={category.id}
                  open={expandedCategories[category.id]}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <div className="border rounded-lg">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center gap-3 cursor-pointer flex-1">
                          {expandedCategories[category.id] ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <FolderTree className="h-5 w-5 text-primary" />
                          <span className="font-medium">{category.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {category.courseCount || 0} courses
                          </Badge>
                          <Badge variant="outline" className="ml-1">
                            {category.SubCategories?.length || 0} subcategories
                          </Badge>
                        </div>
                      </CollapsibleTrigger>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCreateSubDialog(category);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Sub
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(category);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(category);
                          }}
                          disabled={category.courseCount > 0}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <CollapsibleContent>
                      <div className="border-t bg-muted/30 p-4">
                        {category.SubCategories?.length > 0 ? (
                          <div className="space-y-2">
                            {category.SubCategories.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between p-3 bg-background rounded-md border"
                              >
                                <div className="flex items-center gap-3">
                                  <Layers className="h-4 w-4 text-muted-foreground" />
                                  <span>{sub.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditSubDialog(sub)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openDeleteSubDialog(sub)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No subcategories. Click "Add Sub" to create one.
                          </p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ name: e.target.value });
                  setFormError("");
                }}
              />
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCategory?.courseCount > 0 ? (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  This category has {selectedCategory.courseCount} courses and cannot be deleted.
                </div>
              ) : (
                <>
                  Are you sure you want to delete "{selectedCategory?.name}"?
                  This will also delete all subcategories. This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving || selectedCategory?.courseCount > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Subcategory Dialog */}
      <Dialog open={createSubDialogOpen} onOpenChange={setCreateSubDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Subcategory</DialogTitle>
            <DialogDescription>
              Add a new subcategory under a category
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sub-category">Parent Category</Label>
              <Select
                value={subFormData.category_id}
                onValueChange={(value) => {
                  setSubFormData({ ...subFormData, category_id: value });
                  setFormError("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-name">Subcategory Name</Label>
              <Input
                id="sub-name"
                placeholder="Enter subcategory name"
                value={subFormData.name}
                onChange={(e) => {
                  setSubFormData({ ...subFormData, name: e.target.value });
                  setFormError("");
                }}
              />
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateSubDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSubcategory} disabled={saving}>
              {saving ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={editSubDialogOpen} onOpenChange={setEditSubDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>
              Update the subcategory name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sub-name">Subcategory Name</Label>
              <Input
                id="edit-sub-name"
                placeholder="Enter subcategory name"
                value={subFormData.name}
                onChange={(e) => {
                  setSubFormData({ ...subFormData, name: e.target.value });
                  setFormError("");
                }}
              />
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSubDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubcategory} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subcategory Confirmation Dialog */}
      <AlertDialog open={deleteSubDialogOpen} onOpenChange={setDeleteSubDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSubcategory?.name}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubcategory}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
