import { defineCollection, z } from "astro:content";

const toolsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lastUpdated: z.date().optional(),
  }),
});

export const collections = {
  tools: toolsCollection,
};
