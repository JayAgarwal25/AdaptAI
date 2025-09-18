"use server";
/**
 * Generates a step-by-step lecture flow for whiteboard video playback.
 * Returns an array of steps: speak, write, animate, etc.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RepurposeContentIntoLectureInputSchema = z.object({
  content: z.string().describe('The content to convert into a lecture flow.'),
  language: z.string().describe('The target language for the lecture.'),
});
export type RepurposeContentIntoLectureInput = z.infer<typeof RepurposeContentIntoLectureInputSchema>;

const RepurposeContentIntoLectureOutputSchema = z.object({
  lectureSteps: z.array(
    z.object({
      stepType: z.string(),
      content: z.string(),
    })
  ).describe('Array of lecture steps for whiteboard video playback.'),
  script: z.string().describe('Full script for reference.'),
});
export type RepurposeContentIntoLectureOutput = z.infer<typeof RepurposeContentIntoLectureOutputSchema>;

export async function repurposeContentIntoLecture(input: RepurposeContentIntoLectureInput): Promise<RepurposeContentIntoLectureOutput> {
  return repurposeContentIntoLectureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'repurposeContentIntoLecturePrompt',
  input: { schema: RepurposeContentIntoLectureInputSchema },
  output: { schema: RepurposeContentIntoLectureOutputSchema },
  prompt: `You are an AI assistant that converts content into a step-by-step lecture for whiteboard video playback.

Instructions:
- First, generate a clear and concise title for the entire lecture. Output this as 'lectureTitle'.
- Break the content into slides. Each slide should have a title and Markdown-formatted content (headings, bullet points, paragraphs, equations in LaTeX, etc.).
- Structure the output as an array of slides: [{ title: string, content: string (Markdown), speak?: string }].
- For narration, include a "speak" field for each slide (Markdown, plain text, or summary).
- Do NOT use "animate" or any avatar/gesture instructions.
- Use clear, concise language suitable for a short video lecture.
- Only include instructions that make sense for a whiteboard video (no avatar, no gestures, no pointing, no showing).
- Return the lectureTitle, the array of slides, and the full script (also Markdown-formatted).

Content: {{{content}}}
Language: {{language}}
Lecture Title, Slides, and Script:`,
});

const repurposeContentIntoLectureFlow = ai.defineFlow(
  {
    name: 'repurposeContentIntoLectureFlow',
    inputSchema: RepurposeContentIntoLectureInputSchema,
    outputSchema: RepurposeContentIntoLectureOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
