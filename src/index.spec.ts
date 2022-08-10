import { Game, getRemainingWords, solve } from ".";

describe("guess", () => {
	it("returns the correct pattern", () => {
		const game = new Game("PLACE");

		expect(game.guess("FORET")).toEqual("00010");
		expect(game.guess("PLACE")).toEqual("22222");
	});

	it("handles duplicate letters in chosen word", () => {
		const game = new Game("FETES");

		expect(game.guess("FORET")).toEqual("20021");
		expect(game.guess("BETES")).toEqual("02222");
		expect(game.guess("CREEE")).toEqual("00120"); // or "00021"
	});

	it("handles duplicate letters in guess word", () => {
		const game = new Game("TRUIE");

		expect(game.guess("DATEE")).toEqual("00102");
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
	"FLEUR",
	"FORCE",
	"DOREE",
	"VACHE",
	"CHAMP",
	"VERRE",
	"HUITS",
];

describe("remainingWords", () => {
	it("computes the remaining words", () => {
		const game = new Game("CHIEN");

		const turn1 = getRemainingWords(
			"GALOP",
			game.guess("GALOP"),
			POSSIBLE_WORDS
		);
		expect(turn1).toEqual(["BIENS", "CHIEN", "VERRE", "HUITS"]);

		const turn2 = getRemainingWords("BIENS", game.guess("BIENS"), turn1);
		expect(turn2).toEqual(["CHIEN"]);

		const turn3 = getRemainingWords("CHIEN", game.guess("CHIEN"), turn2);
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
