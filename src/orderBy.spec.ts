import { orderBy } from "./orderBy";

describe("orderBy", () => {
	it("sorts the elements of the array", () => {
		const colors = [
			"RED",
			"GREEN",
			"WHITE",
			"ORANGE",
			"BLUE",
			"GREEN",
			"PURPLE",
		];

		expect(
			orderBy(
				colors,
				[(color) => color.length, (color) => (color.includes("G") ? 1 : 0)],
				["asc", "desc"]
			)
		).toEqual(["RED", "BLUE", "GREEN", "GREEN", "WHITE", "ORANGE", "PURPLE"]);
	});
});
