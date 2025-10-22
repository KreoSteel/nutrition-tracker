import { z, ZodError } from "zod";
import { prisma } from "../../../../../utils/prisma/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GetCookingHistorySchema = z.object({
   id: z.string(),
});


export async function DELETE(
   req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
   try {
      const resolvedParams = await params;
      const { id } = GetCookingHistorySchema.parse(resolvedParams);
      const cookingHistory = await prisma.cookingHistory.delete({
         where: { id },
      });
      if (!cookingHistory) {
         return NextResponse.json(
            { error: "Cooking history not found" },
            { status: 404 }
         );
      }
      return NextResponse.json(cookingHistory);
   } catch (error) {
      if (error instanceof ZodError) {
         return NextResponse.json(
            { error: "Invalid cooking history ID", details: error.issues },
            { status: 400 }
         );
      }
      console.error("Failed to delete cooking history:", error);
      return NextResponse.json(
         { error: "Failed to delete cooking history" },
         { status: 500 }
      );
   }
}
