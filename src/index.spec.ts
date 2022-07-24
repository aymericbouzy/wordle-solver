import { Game } from ".";

describe("guess", () => {
	it("returns the correct pattern", () => {
		const game = new Game("PLACE");

		expect(game.guess("FORET")).toEqual([0, 0, 0, 1, 0]);
		expect(game.guess("PLACE")).toEqual([2, 2, 2, 2, 2]);
	});

	it("handles duplicate letters in chosen word", () => {
		const game = new Game("FETES");

		expect(game.guess("FORET")).toEqual([2, 0, 0, 2, 1]);
		expect(game.guess("BETES")).toEqual([0, 2, 2, 2, 2]);
		expect(game.guess("CREEE")).toEqual([0, 0, 1, 2, 0]); // or [0, 0, 0, 2, 1]
	});

	it("handles duplicate letters in guess word", () => {
		const game = new Game("TRUIE");

		expect(game.guess("DATEE")).toEqual([0, 0, 1, 0, 2]);
	});
});
