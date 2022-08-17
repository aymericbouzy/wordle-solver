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
		unlessHigherThan = NaN,
		printProgress,
	}: {
		possibleWords: Word[];
		remainingWords: Word[];
		unlessHigherThan?: number;
		printProgress?: boolean;
	}): {
		bestGuess: Word;
		expectation: number;
	} {
		if (remainingWords.length < 3) {
			return {
				bestGuess: remainingWords[0],
				expectation: remainingWords.length === 1 ? 1 : 1.5,
			};
		}

		const charFrequencies = getCharFrequencies(remainingWords);
		const guesses = orderBy(
			possibleWords.filter((word) =>
				word.split("").some((char) => charFrequencies.has(char))
			),
			[
				(word) => (remainingWords.includes(word) ? 0 : 1),
				(word) =>
					word
						.split("")
						.map((char) => {
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							const frequency = charFrequencies.get(char)!;

							return frequency * (1 - frequency);
						})
						.reduce((sum, score) => sum + score, 0),
			],
			["asc", "desc"]
		);

		let iterable = tryEachWord({
			remainingWords,
			possibleWords: guesses,
			unlessHigherThan,
		});

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

		if (expectation) {
			return { bestGuess, expectation };
		}

		throw "too high";
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
	| { guess: Word; aborted: string; expectation: undefined }
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
				yield { guess, aborted: "too high", expectation: undefined };
			} else if (error === "useless guess") {
				yield { guess, aborted: "useless guess", expectation: undefined };
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
	const remainingWordsOtherThanGuess = remainingWords.filter(
		(word) => word !== guess
	);
	const optimisticIndividualOutput =
		(1 + (remainingWords.length - 1) * 2) / remainingWords.length;
	let optimisticOutput =
		remainingWordsOtherThanGuess.length < remainingWords.length
			? optimisticIndividualOutput * remainingWordsOtherThanGuess.length + 1
			: optimisticIndividualOutput * remainingWords.length;

	const patterns = remainingWordsOtherThanGuess.map((solution) =>
		getPattern(solution, guess)
	);

	const patternsWithWeight = orderBy(
		[...count(patterns)],
		([, weight]) => weight,
		"desc"
	);

	if (patternsWithWeight.length === 1) {
		throw "useless guess";
	}

	for (const [pattern, weight] of patternsWithWeight) {
		optimisticOutput -= weight * optimisticIndividualOutput;

		const words = getRemainingWords(guess, pattern as Pattern, remainingWords);

		const allowedContribution =
			unlessHigherThan * remainingWords.length - optimisticOutput;

		const patternUnlessHigherThan = allowedContribution / weight - 1;

		if (patternUnlessHigherThan < 1) {
			throw "too high";
		}

		const result = solve({
			possibleWords,
			remainingWords: words,
			unlessHigherThan: patternUnlessHigherThan,
		});

		optimisticOutput += (result.expectation + 1) * weight;

		if (optimisticOutput > unlessHigherThan * remainingWords.length) {
			throw "too high";
		}
	}

	return optimisticOutput / remainingWords.length;
}

function getCharFrequencies(remainingWords: Word[]): Map<Char, number> {
	const charFrequencies = new Counter<Char>();

	for (const word of remainingWords) {
		for (const char of new Set(word.split(""))) {
			charFrequencies.add(char);
		}
	}

	for (const char of charFrequencies.keys()) {
		charFrequencies.set(
			char,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			charFrequencies.get(char)! / remainingWords.length
		);
	}

	return charFrequencies;
}

function count(patterns: Pattern[]) {
	const counter = new Counter<Pattern>();

	for (const pattern of patterns) {
		counter.add(pattern);
	}

	return counter.entries();
}

class Counter<K> extends Map<K, number> {
	add(key: K) {
		const count = this.get(key);

		if (count) {
			this.set(key, count + 1);
		} else {
			this.set(key, 1);
		}
	}
}
