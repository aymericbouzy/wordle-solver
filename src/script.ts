import { getRemainingWords, Pattern, solve, Word } from ".";
import words from "./words.json";

console.log(
	solve({
		possibleWords: words,
		remainingWords: ([["AIMER", "00001"]] as [Word, Pattern][]).reduce(
			(words, [guess, pattern]) => getRemainingWords(guess, pattern, words),
			words
		),
		printProgress: true,
	})
);
