import { readFileSync, writeFileSync } from "fs";

type Options<A> = { filename?: string; serialize?: (args: A) => string };

// 10 seconds
const SAVE_INTERVAL = 10_000;

export function memoize<A extends any[], R>(
	fun: (...args: A) => R,
	options: Options<A> = {}
): (...args: A) => R {
	const { serialize = JSON.stringify } = options;
	const memory = new Map<string, R>();
	let filePath: string;

	function saveMemory() {
		if (options.filename) {
			const data = JSON.stringify([...memory.entries()], null, 2);

			writeFileSync(filePath, data, { encoding: "utf8" });
		}
	}

	if (options.filename) {
		filePath = `${__dirname}/../data/${
			process.env.NODE_ENV ? process.env.NODE_ENV + "-" : ""
		}${options.filename}.json`;

		console.log(`using ${filePath}`);

		try {
			const data = readFileSync(filePath, { encoding: "utf8" });

			for (const [key, value] of JSON.parse(data)) {
				memory.set(key, value);
			}
		} catch {
			console.info("no data found");
		}

		if (process && typeof process.on === "function") {
			process.on("exit", () => {
				saveMemory();
			});
		}
	}

	let lastSave = new Date();

	return (...args) => {
		const serializedArgs = serialize(args);

		if (!memory.has(serializedArgs)) {
			memory.set(serializedArgs, fun(...args));
		}

		if (new Date().valueOf() - lastSave.valueOf() > SAVE_INTERVAL) {
			saveMemory();
			lastSave = new Date();
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return memory.get(serializedArgs)!;
	};
}
