import assert, { AssertionError } from "assert";

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

		return stringPattern;
	}
}

export function getRemainingWords(
	guess: Word,
	pattern: Pattern,
	words: Word[]
): Word[] {
	return words.filter((solution) => {
		const game = new Game(solution);

		return game.guess(guess) === pattern;
	});
}

export function solve({
	possibleWords,
	remainingWords,
}: {
	possibleWords: Word[];
	remainingWords: Word[];
}): {
	bestGuess: Word;
	expectation: number;
} {
	if (remainingWords.length < 2) {
		return { bestGuess: remainingWords[0], expectation: 1 };
	}

	let bestGuess = "";
	let expectation = 0;

	for (const guess of possibleWords) {
		try {
			const guessExpectation = getGuessExpectation(guess, {
				remainingWords,
				possibleWords,
			});

			if (!expectation || expectation > guessExpectation) {
				expectation = guessExpectation;
				bestGuess = guess;
			}
		} catch (error) {
			if (
				!(error instanceof AssertionError && error.message === "useless guess")
			) {
				throw error;
			}
		}
	}

	return { bestGuess, expectation };
}

function getGuessExpectation(
	guess: Word,
	{
		remainingWords,
		possibleWords,
	}: { remainingWords: Word[]; possibleWords: Word[] }
) {
	const expectations = remainingWords.map((solution) => {
		if (solution === guess) {
			return 1;
		}

		const words = getRemainingWords(
			guess,
			new Game(solution).guess(guess),
			remainingWords
		);

		assert(words.length < remainingWords.length, "useless guess");

		const result = solve({ possibleWords, remainingWords: words });

		return result.expectation + 1;
	});

	return expectations.reduce((s, e) => s + e, 0) / expectations.length;
}
