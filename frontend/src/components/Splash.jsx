import React, { useState, useEffect } from 'react';

export default function Splash({ onComplete }) {
  const [text, setText] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const fullText = 'MERRKY LONDON';

  useEffect(() => {
    let index = 0;
    // Types one character every 70ms. 13 characters take ~910ms.
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setText((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        // Hold for 500ms after typing finishes, then trigger fade out
        setTimeout(() => {
          setFadeOut(true);
          // Wait for the 400ms transition to complete before unmounting
          setTimeout(() => {
            onComplete();
          }, 400);
        }, 500);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <>
      <style>{`
        @keyframes cursor-blink {
          50% { opacity: 0; }
        }
        .blinking-cursor {
          animation: cursor-blink 0.9s step-start infinite;
        }
      `}</style>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[#ffffff] transition-opacity duration-400 ease-in-out ${
          fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="text-center">
          <h1
            className="font-bold tracking-[0.3em] text-[#111111]"
            style={{
              fontFamily: "'Outfit', 'Inter', sans-serif",
              fontSize: 'min(7.5vw, 36px)',
              fontWeight: 800,
            }}
          >
            {text}
            <span className="blinking-cursor font-light text-[#888888] ml-1">|</span>
          </h1>
        </div>
      </div>
    </>
  );
}
