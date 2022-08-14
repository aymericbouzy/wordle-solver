import assert from "assert";
import { orderBy } from "lodash";
import { memoize } from "./memoize";
import { progress } from "./progress";

type Char = string;
// FIXME
export type Word = string;
// type SplitWord = [Char, Char, Char, Char, Char];
type PatternChar = 0 | 1 | 2;
export type Pattern =
	`${PatternChar}${PatternChar}${PatternChar}${PatternChar}${PatternChar}`;

const fiveLetterWord = /^[A-Z]{5}$/;

export const getPattern = memoize(
	"patterns",
	(solution, guess) => `${solution}:${guess}`,
	(solution: Word, guess: Word) => {
		assert.ok(fiveLetterWord.test(solution));
		assert.ok(fiveLetterWord.test(guess));
		const letterCounts = solution.split("").reduce((counts, char) => {
			if (!counts[char]) counts[char] = 0;

			counts[char] += 1;

			return counts;
		}, {} as Record<string, number>);

		const pattern = Array(5).fill(0);

		guess.split("").forEach((char, index) => {
			if (solution[index] === char) {
				letterCounts[char] -= 1;

				pattern[index] = 2;
			}
		});

		guess.split("").forEach((char, index) => {
			if (solution[index] !== char && letterCounts[char]) {
				letterCounts[char] -= 1;

				pattern[index] = 1;
			}
		});

		const stringPattern = pattern.join("") as Pattern;

		return stringPattern;
	}
);

export function getRemainingWords(
	guess: Word,
	pattern: Pattern,
	words: Word[]
): Word[] {
	return words.filter((solution) => {
		return getPattern(solution, guess) === pattern;
	});
}

export const solve = memoize(
	"expectations",
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
		const possibleLetters = getPossibleChars(remainingWords);
		const guesses = orderBy(
			possibleWords.filter((word) =>
				word.split("").some((char) => possibleLetters.has(char))
			),
			(word) => (remainingWords.includes(word) ? 0 : 1)
		);

		let iterable = tryEachWord({ remainingWords, possibleWords: guesses });

		if (printProgress) {
			iterable = progress(iterable, guesses.length);
		}

		let bestGuess = "";
		let expectation = 0;

		for (const result of iterable) {
			if (
				result.expectation &&
				(!expectation || expectation > result.expectation)
			) {
				expectation = result.expectation;
				bestGuess = result.guess;
			}
		}

		return { bestGuess, expectation };
	}
);

function* tryEachWord({
	remainingWords,
	possibleWords,
	unlessHigherThan: initialUnlessHigherThan = NaN,
}: {
	remainingWords: Word[];
	possibleWords: Word[];
	unlessHigherThan?: number;
}): Iterable<
	| { guess: Word; expectation: number }
	| { guess: Word; error: string; expectation: undefined }
> {
	let unlessHigherThan = initialUnlessHigherThan;

	for (const guess of possibleWords) {
		try {
			const expectation = getGuessExpectation(guess, {
				possibleWords,
				remainingWords,
				unlessHigherThan,
			});

			if (!unlessHigherThan || expectation < unlessHigherThan) {
				unlessHigherThan = expectation;
			}

			yield { expectation, guess };

			if (expectation < 2) {
				break;
			}
		} catch (error) {
			if (error === "too high") {
				yield { guess, error: "too high", expectation: undefined };
			} else if (error === "useless guess") {
				yield { guess, error: "useless guess", expectation: undefined };
			} else {
				throw error;
			}
		}
	}
}

function getGuessExpectation(
	guess: Word,
	{
		possibleWords,
		remainingWords,
		unlessHigherThan,
	}: {
		remainingWords: Word[];
		possibleWords: Word[];
		unlessHigherThan: number;
	}
) {
	const optimisticIndividualOutput =
		(1 + (remainingWords.length - 1) * 2) / remainingWords.length;
	let optimisticOutput = remainingWords.length * optimisticIndividualOutput;

	for (const solution of remainingWords) {
		optimisticOutput -= optimisticIndividualOutput;

		if (solution === guess) {
			optimisticOutput += 1;
		} else {
			const words = getRemainingWords(
				guess,
				getPattern(solution, guess),
				remainingWords
			);

			if (words.length === remainingWords.length) {
				throw "useless guess";
			}

			const result = solve({ possibleWords, remainingWords: words });

			optimisticOutput += result.expectation + 1;
		}

		if (optimisticOutput > unlessHigherThan * remainingWords.length) {
			throw "too high";
		}
	}

	return optimisticOutput / remainingWords.length;
}

function getPossibleChars(remainingWords: Word[]): Set<Char> {
	const possibleChars = new Set<Char>();

	for (const word of remainingWords) {
		for (const char of word) {
			possibleChars.add(char);
		}
	}

	return possibleChars;
}
