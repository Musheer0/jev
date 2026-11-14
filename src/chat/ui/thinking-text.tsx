import { useEffect, useState } from "react";
import { Shimmer } from "@/components/ai-elements/shimmer";

const WORDS = [
  "Researching", "Fanmothing", "Justifying", "Flibbering", "Noodling",
  "Spelunking", "Combobulating", "Wibbling", "Pondering", "Quibbling",
  "Fandangling", "Percolating", "Bamboozling", "Reticulating", "Gallivanting",
];

const pick = (prev?: string) => {
  let next = WORDS[Math.floor(Math.random() * WORDS.length)];
  while (next === prev) next = WORDS[Math.floor(Math.random() * WORDS.length)];
  return next;
};

export function Thinking({ intervalMs = 1800 }: { intervalMs?: number }) {
  const [word, setWord] = useState(() => pick());

  useEffect(() => {
    const id = setInterval(() => setWord((w) => pick(w)), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return <Shimmer duration={1.5}>{`${word}…`}</Shimmer>;
}