import { useEffect, useState } from "react";
import { Upload, X, AlertCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCategories } from "@/lib/apiCalls/categories/getCategories.apiCall";
import { getSubCategories } from "@/lib/apiCalls/categories/getSubCategories.apiCall";
import { validateField, validationRules } from "@/lib/validation/courseValidation";
import { toast } from "sonner";

export function CourseDetailsForm({ 
  courseData, 
  setCourseData, 
  mode = "create", 
  onSave = null 
}) {
  
  const isEditMode = mode === "edit";
  const canEdit = !isEditMode || courseData?.status !== "pending_review";
  
  
  const [categories, setCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  
  
  const [validationErrors, setValidationErrors] = useState({});
  
  
  const [saving, setSaving] = useState(false);

  
  useEffect(() => {
    fetchCategoriesAndSubCategories();
  }, []);

  const fetchCategoriesAndSubCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);

      
      const [categoriesResponse, subCategoriesResponse] = await Promise.all([
        getCategories(),
        getSubCategories(),
      ]);

      setCategories(categoriesResponse.data || []);
      setAllSubCategories(subCategoriesResponse.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoriesError(error.message || "Failed to load categories");
      toast.error("Failed to load categories. Please try again.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  
  const filteredSubCategories = courseData?.category
    ? allSubCategories.filter((sub) => sub.category_id === courseData.category)
    : [];

  
  const handleFieldChange = (field, value) => {
    
    setCourseData({ ...courseData, [field]: value });

    
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: null });
    }
  };

  
  const handleFieldBlur = (field) => {
    const error = validateField(field, courseData?.[field], validationRules.course);
    if (error) {
      setValidationErrors({ ...validationErrors, [field]: error });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      
      setCourseData({
        ...courseData,
        thumbnailFile: file,
        thumbnail: URL.createObjectURL(file), 
      });
    }
  };

  const removeThumbnail = () => {
    
    if (courseData?.thumbnail && courseData.thumbnail.startsWith("blob:")) {
      URL.revokeObjectURL(courseData.thumbnail);
    }
    setCourseData({
      ...courseData,
      thumbnail: "",
      thumbnailFile: null,
    });
  };

  
  const handleSave = async () => {
    if (!canEdit) {
      toast.error("Cannot edit course while it is pending review");
      return;
    }

    
    const errors = {};
    Object.keys(validationRules.course).forEach((field) => {
      const error = validateField(field, courseData?.[field], validationRules.course);
      if (error) errors[field] = error;
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix validation errors before saving");
      return;
    }

    if (onSave) {
      setSaving(true);
      try {
        await onSave(courseData);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <h2 className="mb-6 text-neutral-900 dark:text-white">Course Details</h2>

        {}
        {isEditMode && !canEdit && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Course Under Review
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                This course is currently under review and cannot be edited. You'll be able to make changes once the review is complete.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {/* Course Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Course Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Complete Web Development Bootcamp"
              value={courseData?.title || ""}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              onBlur={() => handleFieldBlur("title")}
              disabled={isEditMode && !canEdit}
              className={validationErrors.title ? "border-red-500" : ""}
            />
            {validationErrors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.title}
              </p>
            )}
          </div>

          {/* Course Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">
              Course Subtitle <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subtitle"
              placeholder="A brief subtitle for your course"
              value={courseData?.subtitle || ""}
              onChange={(e) => handleFieldChange("subtitle", e.target.value)}
              onBlur={() => handleFieldBlur("subtitle")}
              disabled={isEditMode && !canEdit}
              maxLength={500}
              className={validationErrors.subtitle ? "border-red-500" : ""}
            />
            {validationErrors.subtitle && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.subtitle}
              </p>
            )}
            <p className="text-xs text-neutral-500">
              {courseData?.subtitle?.length || 0}/500 characters
            </p>
          </div>

          {/* Course Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Course Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn in this course..."
              value={courseData?.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              onBlur={() => handleFieldBlur("description")}
              disabled={isEditMode && !canEdit}
              rows={4}
              className={`resize-none ${validationErrors.description ? "border-red-500" : ""}`}
              maxLength={5000}
            />
            {validationErrors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.description}
              </p>
            )}
            <p className="text-xs text-neutral-500">
              {courseData?.description?.length || 0}/5000 characters
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            {categoriesLoading ? (
              <div className="flex items-center gap-2 p-2 border border-neutral-300 rounded-lg">
                <RefreshCw className="w-4 h-4 animate-spin text-neutral-500" />
                <span className="text-sm text-neutral-500">Loading categories...</span>
              </div>
            ) : categoriesError ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 border border-red-300 bg-red-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">{categoriesError}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fetchCategoriesAndSubCategories}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
              </div>
            ) : (
              <Select
                value={courseData?.category || ""}
                onValueChange={(value) => {
                  handleFieldChange("category", value);
                  // Clear subcategory when category changes
                  setCourseData({
                    ...courseData,
                    category: value,
                    subcategory_id: "",
                  });
                }}
                disabled={isEditMode && !canEdit}
              >
                <SelectTrigger id="category" className={validationErrors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {validationErrors.category && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.category}
              </p>
            )}
          </div>

          {/* Subcategory */}
          <div className="space-y-2">
            <Label htmlFor="subcategory_id">
              Subcategory <span className="text-red-500">*</span>
            </Label>
            <Select
              value={courseData?.subcategory_id || ""}
              onValueChange={(value) => handleFieldChange("subcategory_id", value)}
              disabled={!courseData?.category || categoriesLoading || (isEditMode && !canEdit)}
            >
              <SelectTrigger id="subcategory_id" className={validationErrors.subcategory_id ? "border-red-500" : ""}>
                <SelectValue placeholder={!courseData?.category ? "Select a category first" : "Select subcategory"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSubCategories.length === 0 ? (
                  <div className="p-2 text-sm text-neutral-500">
                    No subcategories available
                  </div>
                ) : (
                  filteredSubCategories.map((subcat) => (
                    <SelectItem key={subcat.id} value={subcat.id}>
                      {subcat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {validationErrors.subcategory_id && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.subcategory_id}
              </p>
            )}
          </div>

          {/* Level */}
          <div className="space-y-2">
            <Label htmlFor="level">
              Level <span className="text-red-500">*</span>
            </Label>
            <Select
              value={courseData?.level || ""}
              onValueChange={(value) => handleFieldChange("level", value)}
              disabled={isEditMode && !canEdit}
            >
              <SelectTrigger id="level" className={validationErrors.level ? "border-red-500" : ""}>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.level && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.level}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">
              Price (USD) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                $
              </span>
              <Input
                id="price"
                type="number"
                placeholder="49.99"
                value={courseData?.price || ""}
                onChange={(e) => handleFieldChange("price", e.target.value)}
                onBlur={() => handleFieldBlur("price")}
                disabled={isEditMode && !canEdit}
                className={`pl-7 ${validationErrors.price ? "border-red-500" : ""}`}
                min="0"
                step="0.01"
              />
            </div>
            {validationErrors.price && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.price}
              </p>
            )}
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              placeholder="10"
              value={courseData?.discount || ""}
              onChange={(e) =>
                setCourseData({ ...courseData, discount: e.target.value })
              }
              min="0"
              max="100"
            />
          </div>

          {/* Learning Objectives */}
          <div className="space-y-2">
            <Label htmlFor="learning_objectives">
              What will students learn? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="learning_objectives"
              placeholder="List the key learning objectives (e.g., Build responsive websites, Master React hooks, Deploy to production)"
              value={courseData?.learning_objectives || ""}
              onChange={(e) => handleFieldChange("learning_objectives", e.target.value)}
              onBlur={() => handleFieldBlur("learning_objectives")}
              rows={4}
              className={`resize-none ${validationErrors.learning_objectives ? "border-red-500" : ""}`}
              maxLength={2000}
            />
            {validationErrors.learning_objectives && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.learning_objectives}
              </p>
            )}
            <p className="text-xs text-neutral-500">
              {courseData?.learning_objectives?.length || 0}/2000 characters
            </p>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">
              Course Requirements <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="requirements"
              placeholder="What do students need before taking this course? (e.g., Basic HTML/CSS knowledge, A computer with internet)"
              value={courseData?.requirements || ""}
              onChange={(e) => handleFieldChange("requirements", e.target.value)}
              onBlur={() => handleFieldBlur("requirements")}
              rows={3}
              className={`resize-none ${validationErrors.requirements ? "border-red-500" : ""}`}
              maxLength={2000}
            />
            {validationErrors.requirements && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.requirements}
              </p>
            )}
            <p className="text-xs text-neutral-500">
              {courseData?.requirements?.length || 0}/2000 characters
            </p>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="target_audience">
              Who is this course for? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="target_audience"
              placeholder="Describe your target audience (e.g., Beginners wanting to learn web development, Developers looking to master React)"
              value={courseData?.target_audience || ""}
              onChange={(e) => handleFieldChange("target_audience", e.target.value)}
              onBlur={() => handleFieldBlur("target_audience")}
              rows={3}
              className={`resize-none ${validationErrors.target_audience ? "border-red-500" : ""}`}
              maxLength={2000}
            />
            {validationErrors.target_audience && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.target_audience}
              </p>
            )}
            <p className="text-xs text-neutral-500">
              {courseData?.target_audience?.length || 0}/2000 characters
            </p>
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label>
              Course Thumbnail <span className="text-red-500">*</span>
            </Label>
            {!courseData?.thumbnail ? (
              <label
                htmlFor="thumbnail-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Click to upload thumbnail
                </span>
                <span className="text-xs text-neutral-500 mt-1">
                  Recommended: 1280x720px
                </span>
                <input
                  id="thumbnail-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            ) : (
              <div className="relative w-full h-40 rounded-lg overflow-hidden group">
                <img
                  src={courseData.thumbnail}
                  alt="Course thumbnail"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeThumbnail}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Introduction Video Upload */}
          <div className="space-y-2">
            <Label>
              Introduction Video <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Upload a short video introducing your course to potential students (Required)
            </p>
            {!courseData?.introVideoUrl ? (
              <label
                htmlFor="intro-video-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Click to upload introduction video
                </span>
                <span className="text-xs text-neutral-500 mt-1">
                  MP4, WebM, or Ogg (Max 2 minutes recommended)
                </span>
                <input
                  id="intro-video-upload"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCourseData({
                        ...courseData,
                        introVideoFile: file,
                        introVideoUrl: URL.createObjectURL(file),
                      });
                    }
                  }}
                />
              </label>
            ) : (
              <div className="relative w-full rounded-lg overflow-hidden group">
                <video
                  src={courseData.introVideoUrl}
                  controls
                  className="w-full rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    if (courseData.introVideoUrl?.startsWith('blob:')) {
                      URL.revokeObjectURL(courseData.introVideoUrl);
                    }
                    setCourseData({
                      ...courseData,
                      introVideoUrl: "",
                      introVideoFile: null,
                    });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Save Button (Edit Mode Only) */}
        {isEditMode && (
          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800">
            <Button
              type="button"
              onClick={handleSave}
              disabled={!canEdit || saving}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
