import React, { useMemo } from "react";
import DOMPurify from 'dompurify';
import { marked } from "marked";
import katex from "katex";

interface MarkTeXProps {
  content: string;
}

export function renderLatexWithKaTeX(text: string): string {
  if (!text) return "";

  // Normalize AI-generated Markdown dividers
  const normalizedContent = text.replace(/([^\n])\n---/g, '$1\n\n---');

  const mathRegex = /(\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\\\([\s\S]*?\\\))/g;
  const mathBlocks: { html: string }[] = [];

  const placeholderContent = normalizedContent.replace(mathRegex, (match) => {
    let expression = match;
    let isDisplay = false;

    if (match.startsWith('\\[') && match.endsWith('\\]')) {
      expression = match.slice(2, -2);
      isDisplay = true;
    } else if (match.startsWith('$$') && match.endsWith('$$')) {
      expression = match.slice(2, -2);
      isDisplay = true;
    } else if (match.startsWith('\\(') && match.endsWith('\\)')) {
      expression = match.slice(2, -2);
      isDisplay = false;
    }

    try {
      const renderedHtml = katex.renderToString(expression, {
        displayMode: isDisplay,
        throwOnError: false,
      });
      mathBlocks.push({ html: renderedHtml });
    } catch (e) {
      mathBlocks.push({ html: match });
    }

    return `%%MATH_${mathBlocks.length - 1}%%`;
  });

  let parsedContent = marked.parse(placeholderContent, { async: false }) as string;

  mathBlocks.forEach((block, index) => {
    parsedContent = parsedContent.replace(`%%MATH_${index}%%`, block.html);
  });

  return DOMPurify.sanitize(parsedContent, {
    ADD_TAGS: [
      'annotation', 'semantics', 'math', 'mrow', 'mi', 'mo', 'mn', 
      'mfrac', 'msup', 'msub', 'mover', 'munder', 'msubsup', 'msqrt', 
      'mroot', 'mtable', 'mtr', 'mtd', 'span', 'path', 'svg'
    ],
    ADD_ATTR: ['aria-hidden', 'viewBox', 'd', 'style', 'class', 'encoding']
  });
}

const MarkTeX: React.FC<MarkTeXProps> = ({ content }) => {
  const html = useMemo(() => renderLatexWithKaTeX(content), [content]);

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
};

export default MarkTeX;
