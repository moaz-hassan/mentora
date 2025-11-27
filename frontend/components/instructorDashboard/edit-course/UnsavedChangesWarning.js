import { AlertCircle } from "lucide-react";

export function UnsavedChangesWarning({ hasUnsavedChanges }) {
  if (!hasUnsavedChanges) return null;

  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="font-semibold text-yellow-900">Unsaved Changes</h3>
        <p className="text-sm text-yellow-700 mt-1">
          You have unsaved changes. Make sure to save your work before leaving this page.
        </p>
      </div>
    </div>
  );
}
