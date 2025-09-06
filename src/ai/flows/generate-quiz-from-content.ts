"use server";
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
  prompt: `You are an advanced AI quiz generator. Based on the following content, generate a quiz in the specified language. The quiz should include a variety of question types:

- Multiple Choice Questions (MCQ)
- Brief Answer Questions
- True/False Questions
- Fill in the Blanks

Output the quiz as a JSON array, where each item is an object with:
  - type: "mcq" | "brief" | "truefalse" | "fillblank"
  - question: string
  - options?: string[] (for mcq)
  - answer: string
  - explanation: string (a very brief explanation for the answer)

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
