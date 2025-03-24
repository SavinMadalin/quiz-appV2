// src/components/CodeSnippet.js
import React, { useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Or any other style you prefer

const CodeSnippet = ({ code, language }) => {
  const codeRef = useRef(null);

  useEffect(() => {
    const adjustFontSize = () => {
      if (codeRef.current) {
        const container = codeRef.current;
        const textElement = container.querySelector('.code-snippet');
        if (textElement) {
          textElement.style.fontSize = '0.8rem'; // Reset font size
          let fontSize = parseFloat(window.getComputedStyle(textElement).fontSize);
          while (textElement.scrollHeight > container.clientHeight && fontSize > 0.5) {
            fontSize -= 0.1;
            textElement.style.fontSize = `${fontSize}rem`;
          }
        }
      }
    };

    adjustFontSize();
  }, [code]);

  return (
    <div className="rounded-md overflow-auto my-4 code-snippet-container max-h-60" ref={codeRef}>
      <SyntaxHighlighter language={language} style={dracula} wrapLongLines={true} className="code-snippet">
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeSnippet;
