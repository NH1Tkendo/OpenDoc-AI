"use client";

import { useState } from "react";
import { deleteProject } from "@/app/actions/project";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface DeleteProjectButtonProps {
  projectId: string;
  projectName: string;
  onSuccess?: () => void;
}

export function DeleteProjectButton({
  projectId,
  projectName,
  onSuccess,
}: DeleteProjectButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete project";
      alert(`Error: ${message}`);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">Delete "{projectName}"?</span>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Icons.Spinner className="h-3 w-3 animate-spin" />
          ) : (
            "Confirm"
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete project"
    >
      <Icons.Trash className="h-4 w-4 text-red-500" />
    </Button>
  );
}
