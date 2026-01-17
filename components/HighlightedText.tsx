import React from 'react';

interface HighlightedTextProps {
  text: string;
  highlight: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, highlight }) => {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  
  const parts = text.split(highlight);
  
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="underline decoration-indigo-500 decoration-2 underline-offset-4 font-bold text-indigo-900">
              {highlight}
            </span>
          )}
        </React.Fragment>
      ))}
    </>
  );
};
