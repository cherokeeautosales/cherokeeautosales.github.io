import { z, defineCollection } from 'astro:content';

const schema = {
    title: z.string(),
    description: z.string(),
    icon: z.string().default("FaCar"),
};

const blogSchema = {...schema};

const blogCollection = defineCollection({
    schema: z.object(blogSchema),
});

export const collections = {
    'blog': blogCollection,
};