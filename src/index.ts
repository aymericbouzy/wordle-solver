import assert from "assert";

// // FIXME
// type Char = string;
// FIXME
type Word = string;
// type SplitWord = [Char, Char, Char, Char, Char];
type PatternChar = 0 | 1 | 2;
type Pattern =
	`${PatternChar}${PatternChar}${PatternChar}${PatternChar}${PatternChar}`;

const fiveLetterWord = /^[A-Z]{5}$/;

export class Game {
	constructor(private readonly chosenWord: Word) {
		assert(fiveLetterWord.test(this.chosenWord));
	}

	guess(guessWord: Word): Pattern {
		assert(fiveLetterWord.test(guessWord));

		const letterCounts = this.chosenWord.split("").reduce((counts, char) => {
			if (!counts[char]) counts[char] = 0;

			counts[char] += 1;

			return counts;
		}, {} as Record<string, number>);

		const pattern = Array(5).fill(0);

		guessWord.split("").forEach((char, index) => {
			if (this.chosenWord[index] === char) {
				letterCounts[char] -= 1;

				pattern[index] = 2;
			}
		});

		guessWord.split("").forEach((char, index) => {
			if (this.chosenWord[index] !== char && letterCounts[char]) {
				letterCounts[char] -= 1;

				pattern[index] = 1;
			}
		});

		const stringPattern = pattern.join("") as Pattern;

		this.guesses.push({ word: guessWord, pattern: stringPattern });

		return stringPattern;
	}
}
