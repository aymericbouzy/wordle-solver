import { readFileSync, writeFileSync } from "fs";

export function memoize<A extends any[], R>(
	filename: string,
	serialize: (...args: A) => string,
	fun: (...args: A) => R
): (...args: A) => R {
	const memory = new Map<string, R>();

	try {
		const data = readFileSync(`${__dirname}/${filename}.json`, {
			encoding: "utf8",
		});

		for (const [key, value] of JSON.parse(data)) {
			memory.set(key, value);
		}
	} catch {
		console.info("no data found");
	}

	function saveMemory() {
		const data = JSON.stringify([...memory.entries()]);

		writeFileSync(`${__dirname}/${filename}.json`, data, {
			encoding: "utf8",
		});
	}

	let counter = 0;

	return (...args) => {
		const serializedArgs = serialize(...args);

		if (!memory.has(serializedArgs)) {
			memory.set(serializedArgs, fun(...args));

			if (counter > 500) {
				counter = 0;
				saveMemory();
			} else {
				counter++;
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return memory.get(serializedArgs)!;
	};
}
