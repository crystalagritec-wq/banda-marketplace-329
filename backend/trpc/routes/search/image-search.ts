import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

export const imageSearchProcedure = protectedProcedure
  .input(
    z.object({
      imageUri: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Image Search] Processing image:", input.imageUri);

    return {
      suggestions: [
        { query: "chicken feed", confidence: 0.92 },
        { query: "poultry feed", confidence: 0.88 },
        { query: "layer mash", confidence: 0.75 },
      ],
      detectedObjects: ["bag", "feed", "grain"],
    };
  });
