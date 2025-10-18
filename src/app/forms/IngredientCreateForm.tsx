import { useForm } from "react-hook-form";
import { CreateIngredient, CreateIngredientSchema } from "../../../utils/schemas/ingredient";
import { useCreateIngredient } from "@/app/hooks/useIngredients";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function IngredientCreateForm({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const { mutate: createIngredient } = useCreateIngredient();
    const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateIngredientSchema),
    defaultValues: {
      name: "",
      caloriesPer100g: 0 as number,
      proteinPer100g: 0 as number,    
      carbsPer100g: 0 as number,
      fatPer100g: 0 as number,
      category: "",
    },
  });

  const onSubmit = (data: CreateIngredient, e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    createIngredient(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["ingredients"] });
        toast.success(`Ingredient ${data.name} created successfully!`);
        setOpen(false);
      },
      onError: () => {
        toast.error(`Failed to create ingredient ${data.name}`);
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Ingredient</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Add a new ingredient to your database.
        </DialogDescription>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(onSubmit)(e);
          }} 
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input type="text" id="name" {...register("name")} placeholder="Enter ingredient name" />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" {...register("category")} placeholder="Enter ingredient category (optional)" />
            {errors.category && <p className="text-red-500">{errors.category.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="caloriesPer100g">Calories per 100g</Label>
            <Input
              type="number"
              step="0.10"
              id="caloriesPer100g"
              {...register("caloriesPer100g")}
            />
            {errors.caloriesPer100g && <p className="text-red-500">{errors.caloriesPer100g.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="proteinPer100g">Protein per 100g</Label>
            <Input
              type="number"
              step="0.10"
              id="proteinPer100g"
              {...register("proteinPer100g")}
            />
            {errors.proteinPer100g && <p className="text-red-500">{errors.proteinPer100g.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="carbsPer100g">Carbs per 100g</Label>
            <Input
              type="number"
              step="0.10"
              id="carbsPer100g"
              {...register("carbsPer100g")}
            />
            {errors.carbsPer100g && <p className="text-red-500">{errors.carbsPer100g.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="fatPer100g">Fat per 100g</Label>
            <Input
              type="number"
              step="0.10"
              id="fatPer100g"
              {...register("fatPer100g")}
            />
            {errors.fatPer100g && <p className="text-red-500">{errors.fatPer100g.message}</p>}
          </div>
          <div className="flex justify-start gap-2 mt-4">
            <Button type="submit">Save Ingredient</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
