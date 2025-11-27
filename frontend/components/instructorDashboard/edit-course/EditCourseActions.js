import { Button } from "@/components/ui/button";

export function EditCourseActions({ isSaving, hasUnsavedChanges, onSave, onCancel }) {
  return (
    <div className="flex justify-end gap-4 pt-6 border-t border-neutral-200">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      )}
      <Button
        type="button"
        onClick={onSave}
        disabled={isSaving || !hasUnsavedChanges}
        className={
          !hasUnsavedChanges
            ? "bg-neutral-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
