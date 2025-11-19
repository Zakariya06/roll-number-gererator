// useRollNumbers.js
import { useState } from "react";

export function useRollNumbers(initialStart = "0000001") {
  const [start, setStart] = useState(initialStart);

  // Helper to pad numbers
  const padNumber = (num, targetLength) => {
    return String(num).padStart(targetLength, "0");
  };

  // Generate next roll number
  const getNextRollNumber = (index = 0) => {
    const numericStart = parseInt(start, 10);
    const nextValue = numericStart + index;
    return padNumber(nextValue, start.length);
  };

  // Generate list for an array
  const generateRollList = (array) => {
    return array.map((_, index) => getNextRollNumber(index));
  };

  // Reset roll start
  const resetStart = (newStart = initialStart) => {
    setStart(newStart);
  };

  return {
    start,
    setStart,
    getNextRollNumber,
    generateRollList,
    resetStart,
  };
}
