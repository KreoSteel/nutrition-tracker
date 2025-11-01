import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteRecipe } from "@/app/hooks/useRecipes";
import { useState } from "react";
import { toast } from "sonner";
import { RecipeResponse } from "../../../utils/schemas";

export default function RecipeDelete({
  children,
  recipe,
}: {
  children: React.ReactNode;
  recipe: RecipeResponse;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate: deleteRecipe } = useDeleteRecipe();

  const onDelete = () => {
    setIsDeleting(true);
    deleteRecipe(recipe.id!, {
      onSuccess: () => {
        toast.success("Recipe deleted successfully");
        setIsOpen(false);
        setIsDeleting(false);
      },
      onError: () => {
        toast.error("Failed to delete recipe");
        setIsDeleting(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Delete Recipe
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              &quot;{recipe.name}&quot;
            </span>
            ?
            <br />
            <span className="text-sm text-red-600 dark:text-red-400 mt-1 block">
              This action cannot be undone.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>Delete Recipe</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
