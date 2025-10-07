import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

export const voiceSearchProcedure = protectedProcedure
  .input(
    z.object({
      audioUri: z.string(),
      language: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("[Voice Search] Processing audio:", input.audioUri);

    return {
      transcription: "chicken feed",
      confidence: 0.95,
      language: input.language || "en",
    };
  });
