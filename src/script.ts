import { getRemainingWords, solve } from ".";
import words from "./words.json";

console.log(
	solve({
		possibleWords: words,
		remainingWords: getRemainingWords("AIMER", "00001", words),
		printProgress: true,
	})
);
