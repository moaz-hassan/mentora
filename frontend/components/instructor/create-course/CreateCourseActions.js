export function CreateCourseActions({
  canSave,
  canSubmit,
  validationMessage,
  onSaveDraft,
  onSubmitForReview,
  onPreview,
}) {
  return (
    <div className="flex justify-end gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
      <button
        type="button"
        onClick={onPreview}
        disabled={!canSave}
        className={`px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
          !canSave ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Preview Course
      </button>
      <button
        type="button"
        onClick={onSaveDraft}
        disabled={!canSave}
        className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
          !canSave
            ? "bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed"
            : "bg-gray-600 hover:bg-gray-700"
        }`}
        title={validationMessage}
      >
        Save as Draft
      </button>
      <button
        type="button"
        onClick={onSubmitForReview}
        disabled={!canSubmit}
        className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
          !canSubmit
            ? "bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        title={validationMessage}
      >
        Send for Review
      </button>
    </div>
  );
}
