import assert, { AssertionError } from "assert";
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

		const iterable = tryEachWord({ remainingWords, possibleWords: guesses });

		const results = printProgress
			? [...progress(iterable, guesses.length)]
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
			const expectation = getGuessExpectation(guess, {
				possibleWords,
				remainingWords,
			});

			yield { expectation, guess };

			if (expectation < 2) {
				break;
			}
		} catch (error) {
			if (
				!(error instanceof AssertionError && error.message === "useless guess")
			) {
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
	}: {
		remainingWords: Word[];
		possibleWords: Word[];
	}
) {
	const expectations = remainingWords.map((solution) => {
		if (solution === guess) {
			return 1;
		}

		const words = getRemainingWords(
			guess,
			getPattern(solution, guess),
			remainingWords
		);

		assert.ok(words.length < remainingWords.length, "useless guess");

		const result = solve({ possibleWords, remainingWords: words });

		return result.expectation + 1;
	});

	return expectations.reduce((s, e) => s + e, 0) / expectations.length;
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
