import chalk from "chalk";
import { getRemainingWords, Pattern, solve, Word } from ".";
import words from "./words.json";

const steps: [Word, Pattern][] = [["AIMER", "10020"]];

for (const [word, pattern] of steps) {
	console.log(
		word
			.split("")
			.map((char, index) => {
				if (pattern[index] === "2") {
					return chalk.bgGreen(char);
				} else if (pattern[index] === "1") {
					return chalk.bgYellow(char);
				} else {
					return chalk.bgGray(char);
				}
			})
			.join("")
	);
}

console.log(
	solve({
		possibleWords: words,
		remainingWords: steps.reduce(
			(words, [guess, pattern]) => getRemainingWords(guess, pattern, words),
			words
		),
		printProgress: true,
	})
);
