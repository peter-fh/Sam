import React, { useEffect, useMemo } from "react";
import DOMPurify from 'dompurify';
import { marked } from "marked";

interface MarkTeXProps {
  content: string
}

interface LaTeXProps {
  content: string
}

const CustomLatex: React.FC<LaTeXProps> = ({content}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.MathJax!.typeset!([containerRef.current])
  }, [content])
  return (
    <div ref={containerRef} dangerouslySetInnerHTML={{__html: content}}>
    </div>
  )
}

const MarkTeX: React.FC<MarkTeXProps> = ({content}) => {

  const parsedHTML = useMemo(() => {
    const mathBlocks: string[] = [];
    const mathRegex = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;

    // Normalize AI-generated Markdown: ensure blank line before --- dividers so marked doesn't convert text into Setext H2 headers
    const normalizedContent = content.replace(/([^\n])\n---/g, '$1\n\n---');

    const placeholderContent = normalizedContent.replace(mathRegex, (match) => {
      mathBlocks.push(match);
      return `%%MATH_${mathBlocks.length - 1}%%`;
    });

    let parsedContent = marked.parse(placeholderContent, { async: false }) as string;

    mathBlocks.forEach((math, index) => {
      parsedContent = parsedContent.replace(`%%MATH_${index}%%`, math);
    });

    const purifiedContent = DOMPurify.sanitize(parsedContent);
    return purifiedContent;
  }, [content]);

  return (
    <>
      <CustomLatex content={parsedHTML}/>
    </>
  )
}

export default MarkTeX
