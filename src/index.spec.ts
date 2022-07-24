import { Game } from ".";

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
