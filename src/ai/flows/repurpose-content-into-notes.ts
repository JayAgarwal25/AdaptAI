"use server";
/**
 * @fileOverview A content repurposing AI agent that generates student notes in a chosen language.
 *
 * - repurposeContentIntoNotes - A function that handles the notes generation process.
 * - RepurposeContentIntoNotesInput - The input type for the repurposeContentIntoNotes function.
 * - RepurposeContentIntoNotesOutput - The return type for the repurposeContentIntoNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RepurposeContentIntoNotesInputSchema = z.object({
  content: z
    .string()
    .describe('The content to be converted into notes, can be text, a document, or video transcript.'),
  language: z
    .string()
    .describe('The target language for the notes.'),
});
export type RepurposeContentIntoNotesInput = z.infer<typeof RepurposeContentIntoNotesInputSchema>;

const RepurposeContentIntoNotesOutputSchema = z.object({
  notes: z.string().describe('Bullet-pointed student notes highlighting key concepts, definitions, formulae, equations, etc.'),
  progress: z.string().describe('A short summary of the flow execution.'),
});
export type RepurposeContentIntoNotesOutput = z.infer<typeof RepurposeContentIntoNotesOutputSchema>;

export async function repurposeContentIntoNotes(input: RepurposeContentIntoNotesInput): Promise<RepurposeContentIntoNotesOutput> {
  return repurposeContentIntoNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'repurposeContentIntoNotesPrompt',
  input: {schema: RepurposeContentIntoNotesInputSchema},
  output: {schema: RepurposeContentIntoNotesOutputSchema},
  prompt: `You are an AI assistant that generates student notes from content in the chosen language.

Instructions:
- Write the notes in bullet points.
- Highlight key concepts, definitions, important facts, formulae, and equations.
- If the content contains math, equations, or formulas, include them in LaTeX format (delimited by $...$ for inline or $$...$$ for block).
- Use clear, concise language suitable for student revision.

Generate student notes in {{language}} for the following content:
Content: {{{content}}}
Notes:`,
});

const repurposeContentIntoNotesFlow = ai.defineFlow(
  {
    name: 'repurposeContentIntoNotesFlow',
    inputSchema: RepurposeContentIntoNotesInputSchema,
    outputSchema: RepurposeContentIntoNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output!,
      progress: 'Content was converted into student notes in the chosen language.'
    };
  }
);
