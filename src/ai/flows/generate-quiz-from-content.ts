'use server';
/**
 * @fileOverview Generates a quiz from uploaded content.
 *
 * - generateQuizFromContent - A function that handles the quiz generation process.
 * - GenerateQuizFromContentInput - The input type for the generateQuizFromContent function.
 * - GenerateQuizFromContentOutput - The return type for the generateQuizFromContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizFromContentInputSchema = z.object({
  content: z.string().describe('The content to generate a quiz from.'),
  language: z.string().describe('The language for the quiz.'),
});
export type GenerateQuizFromContentInput = z.infer<
  typeof GenerateQuizFromContentInputSchema
>;

const GenerateQuizFromContentOutputSchema = z.object({
  quiz: z.string().describe('The generated quiz.'),
});
export type GenerateQuizFromContentOutput = z.infer<
  typeof GenerateQuizFromContentOutputSchema
>;

export async function generateQuizFromContent(
  input: GenerateQuizFromContentInput
): Promise<GenerateQuizFromContentOutput> {
  return generateQuizFromContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizFromContentPrompt',
  input: {schema: GenerateQuizFromContentInputSchema},
  output: {schema: GenerateQuizFromContentOutputSchema},
  prompt: `You are an AI quiz generator. Generate a quiz based on the following content in the specified language.

Content: {{{content}}}
Language: {{{language}}}

Quiz:`,
});

const generateQuizFromContentFlow = ai.defineFlow(
  {
    name: 'generateQuizFromContentFlow',
    inputSchema: GenerateQuizFromContentInputSchema,
    outputSchema: GenerateQuizFromContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
