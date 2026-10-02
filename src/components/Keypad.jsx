import { useState, useEffect } from "react";

/* The passcode and its length live here, not in TypewriterSequence, so this
   component and the checker can never drift apart. Changing the code is a
   one-line edit. */
export const PASSCODE = "30905";

export default function Keypad({ onSubmit }) {
  const [password, setPassword] = useState("");
  const maxLength = PASSCODE.length;

  const handleNumberClick = (num) => {
    if (password.length < maxLength) {
      setPassword((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPassword((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPassword("");
  };

  const handleSubmit = () => {
    if (password.length === maxLength) {
      if (onSubmit) onSubmit(password);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= "0" && e.key <= "9") {
        handleNumberClick(Number(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleDelete();
      } else if (e.key === "Enter") {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [password]); // eslint-disable-line

  const btnBase =
    "rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 ease-out hover:scale-105 active:scale-95 shadow-md flex items-center justify-center";

  return (
    <div
      className="w-full max-w-[260px] text-center px-2"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Heart & title */}
      <div className="mb-5 landscape:mb-2">
        <div
          className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 landscape:w-8 landscape:h-8 mb-3 landscape:mb-1 transition-transform duration-300 hover:scale-110 hover:rotate-6 rounded-full"
          style={{ background: "linear-gradient(135deg, #fffdd0, #fff4c4)" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6 sm:w-8 sm:h-8 landscape:w-4 landscape:h-4"
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="#ff0000"
              opacity="0.9"
            />
          </svg>
        </div>
        <h2
          className="text-lg sm:text-xl md:text-2xl landscape:text-base font-semibold mb-1 landscape:mb-0"
          style={{ color: "#ff0000", fontFamily: "'Montserrat', sans-serif" }}
        >
          Enter Your Code
        </h2>
        <p
          className="text-xs landscape:text-[10px] opacity-60"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Type {maxLength} special numbers
        </p>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-6 landscape:mb-2">
        {[...Array(maxLength)].map((_, index) => (
          <div
            key={index}
            className="w-10 h-10 landscape:w-7 landscape:h-7 rounded-xl landscape:rounded-lg flex items-center justify-center text-lg landscape:text-sm font-semibold transition-all duration-300"
            style={{
              background: password[index] ? "#ff0000" : "#fffdd0",
              color: password[index] ? "#fff" : "#ccc",
              boxShadow: password[index]
                ? "0 4px 12px rgba(255, 0, 0, 0.3)"
                : "0 2px 6px rgba(0, 0, 0, 0.05)",
              transform: password[index] ? "scale(1.05)" : "scale(1)",
            }}
          >
            {password[index] || "•"}
          </div>
        ))}
      </div>

      {/* Number pad 1-9 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 landscape:gap-1.5 mb-2 landscape:mb-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className={`${btnBase} h-12 sm:h-14 md:h-16 landscape:h-8 landscape:sm:h-10 text-lg sm:text-xl landscape:text-sm`}
            style={{
              background: "linear-gradient(135deg, #fffdd0, #fff9c4)",
              color: "#ff0000",
              fontFamily: "'Montserrat', sans-serif",
              boxShadow: "0 3px 10px rgba(255, 253, 208, 0.5)",
            }}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Bottom row: Clear, 0, Enter */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 landscape:gap-1.5">
        <button
          onClick={handleClear}
          className={`${btnBase} h-12 sm:h-14 md:h-16 landscape:h-8 landscape:sm:h-10 text-xs sm:text-sm landscape:text-[10px] font-medium`}
          style={{
            background: "#ff0000",
            color: "#fff",
            fontFamily: "'Montserrat', sans-serif",
            boxShadow: "0 4px 12px rgba(255, 0, 0, 0.3)",
          }}
        >
          Clear
        </button>
        <button
          onClick={() => handleNumberClick(0)}
          className={`${btnBase} h-12 sm:h-14 md:h-16 landscape:h-8 landscape:sm:h-10 text-lg sm:text-xl landscape:text-sm`}
          style={{
            background: "linear-gradient(135deg, #fffdd0, #fff9c4)",
            color: "#ff0000",
            fontFamily: "'Montserrat', sans-serif",
            boxShadow: "0 3px 10px rgba(255, 253, 208, 0.5)",
          }}
        >
          0
        </button>
        <button
          onClick={handleSubmit}
          disabled={password.length !== maxLength}
          className={`${btnBase} h-12 sm:h-14 md:h-16 landscape:h-8 landscape:sm:h-10 text-xs sm:text-sm landscape:text-[10px] font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none`}
          style={{
            background: password.length === maxLength ? "#ff0000" : "#e0e0e0",
            color: "#fff",
            fontFamily: "'Montserrat', sans-serif",
            boxShadow:
              password.length === maxLength
                ? "0 4px 12px rgba(255, 0, 0, 0.3)"
                : "none",
          }}
        >
          Enter
        </button>
      </div>
    </div>
  );
}