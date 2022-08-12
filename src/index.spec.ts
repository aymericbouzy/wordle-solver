import { getPattern, getRemainingWords, solve } from ".";

describe("guess", () => {
	it("returns the correct pattern", () => {
		expect(getPattern("PLACE", "FORET")).toEqual("00010");
		expect(getPattern("PLACE", "PLACE")).toEqual("22222");
	});

	it("handles duplicate letters in solution word", () => {
		expect(getPattern("FETES", "FORET")).toEqual("20021");
		expect(getPattern("FETES", "BETES")).toEqual("02222");
		expect(getPattern("FETES", "CREEE")).toEqual("00120"); // or "00021"
	});

	it("handles duplicate letters in guess word", () => {
		expect(getPattern("TRUIE", "DATEE")).toEqual("00102");
	});
});

const POSSIBLE_WORDS = [
	"BIENS",
	"CHIEN",
	"RONDE",
	"GALOP",
	"GIGOT",
	"LOUPS",
	"FLEAU",
	"FORCE",
	"DOREE",
	"VACHE",
	"CHAMP",
	"VERRE",
	"HUITS",
	"FLEUR",
];

describe("remainingWords", () => {
	it("computes the remaining words", () => {
		const turn1 = getRemainingWords(
			"GALOP",
			getPattern("CHIEN", "GALOP"),
			POSSIBLE_WORDS
		);
		expect(turn1).toEqual(["BIENS", "CHIEN", "VERRE", "HUITS"]);

		const turn2 = getRemainingWords(
			"BIENS",
			getPattern("CHIEN", "BIENS"),
			turn1
		);
		expect(turn2).toEqual(["CHIEN"]);

		const turn3 = getRemainingWords(
			"CHIEN",
			getPattern("CHIEN", "CHIEN"),
			turn2
		);
		expect(turn3).toEqual(["CHIEN"]);
	});
});

describe("solver", () => {
	it("computes the best guess", () => {
		const { bestGuess, expectation } = solve({
			possibleWords: POSSIBLE_WORDS,
			remainingWords: ["FLEUR", "GALOP", "VERRE", "HUITS"],
		});
		expect(expectation).toBe(1 / 4 + (3 * 2) / 4);
		expect(bestGuess).toBe("FLEUR");
	});
});
