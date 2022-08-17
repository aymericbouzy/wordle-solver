import { readFileSync, writeFileSync } from "fs";

export function memoize<A extends any[], R>(
	filename: string,
	serialize: (args: A) => string,
	fun: (...args: A) => R
): (...args: A) => R {
	const memory = new Map<string, R>();
	const filePath = `${__dirname}/../data/${
		process.env.NODE_ENV ? process.env.NODE_ENV + "-" : ""
	}${filename}.json`;

	console.log(`using ${filePath}`);

	try {
		const data = readFileSync(filePath, { encoding: "utf8" });

		for (const [key, value] of JSON.parse(data)) {
			memory.set(key, value);
		}
	} catch {
		console.info("no data found");
	}

	function saveMemory() {
		const data = JSON.stringify([...memory.entries()], null, 2);

		writeFileSync(filePath, data, { encoding: "utf8" });
	}

	if (process && typeof process.on === "function") {
		process.on("exit", () => {
			saveMemory();
		});
	}

	let counter = 0;

	return (...args) => {
		const serializedArgs = serialize(args);

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
