import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

// Renders math using KaTeX, auto-detects inline/block
export function MathRenderer({ text }: { text: string }) {
  // Simple regex to detect $$...$$ (block) and $...$ (inline)
  const blockRegex = /\$\$(.+?)\$\$/gs;
  const inlineRegex = /\$(.+?)\$/g;

  // Replace block math
  let rendered = text.replace(blockRegex, (_, expr) => `<span class='block-math'>${expr}</span>`);
  // Replace inline math
  rendered = rendered.replace(inlineRegex, (_, expr) => `<span class='inline-math'>${expr}</span>`);

  // Split by custom markers and render
  return (
    <span>
      {rendered.split(/(<span class='block-math'>.+?<\/span>|<span class='inline-math'>.+?<\/span>)/g).map((part, i) => {
        try {
          if (part.startsWith("<span class='block-math'>")) {
            const expr = part.replace(/<span class='block-math'>(.+?)<\/span>/, '$1');
            return <BlockMath key={i}>{expr}</BlockMath>;
          }
          if (part.startsWith("<span class='inline-math'>")) {
            const expr = part.replace(/<span class='inline-math'>(.+?)<\/span>/, '$1');
            return <InlineMath key={i}>{expr}</InlineMath>;
          }
        } catch (err) {
          // If KaTeX rendering fails, show raw text
          return <span key={i}>{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
