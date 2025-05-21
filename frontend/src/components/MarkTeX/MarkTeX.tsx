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
    var doubleEscapedContent =content.replace(/\\/g, '\\\\')
    const parsedContent = marked.parse(doubleEscapedContent, { async: false })
    const purifiedContent = DOMPurify.sanitize(parsedContent)
    return purifiedContent

  }, [content]);

  return (
    <>
      <CustomLatex content={parsedHTML}/>
    </>
  )
}

export default MarkTeX
