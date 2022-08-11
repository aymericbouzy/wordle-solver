import assert, { AssertionError } from "assert";
import { memoize } from "./memoize";
import { progress } from "./progress";

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
		assert.ok(fiveLetterWord.test(chosenWord));
	}

	guess(guessWord: Word): Pattern {
		assert.ok(fiveLetterWord.test(guessWord));

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

export const solve = memoize(
	({ remainingWords }) => remainingWords.sort().join(","),
	function ({
		possibleWords,
		remainingWords,
		printProgress,
	}: {
		possibleWords: Word[];
		remainingWords: Word[];
		printProgress?: boolean;
	}): {
		bestGuess: Word;
		expectation: number;
	} {
		if (remainingWords.length < 2) {
			return { bestGuess: remainingWords[0], expectation: 1 };
		}

		const iterable = tryEachWord({ remainingWords, possibleWords });

		const results = printProgress
			? [...progress(iterable, possibleWords.length)]
			: [...iterable];

		const { guess: bestGuess, expectation } = results.reduce(
			({ guess, expectation }, result) => {
				if (result.expectation < expectation) {
					return result;
				}

				return { guess, expectation };
			}
		);

		return { bestGuess, expectation };
	}
);

function* tryEachWord({
	remainingWords,
	possibleWords,
}: {
	remainingWords: Word[];
	possibleWords: Word[];
}) {
	for (const guess of possibleWords) {
		try {
			const expectations = remainingWords.map((solution) => {
				if (solution === guess) {
					return 1;
				}

				const words = getRemainingWords(
					guess,
					new Game(solution).guess(guess),
					remainingWords
				);

				assert.ok(words.length < remainingWords.length, "useless guess");

				const result = solve({ possibleWords, remainingWords: words });

				return result.expectation + 1;
			});

			yield {
				expectation:
					expectations.reduce((s, e) => s + e, 0) / expectations.length,
				guess,
			};
		} catch (error) {
			if (
				!(error instanceof AssertionError && error.message === "useless guess")
			) {
				throw error;
			}
		}
	}
}
