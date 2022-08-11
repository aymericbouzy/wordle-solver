export function memoize<A extends any[], R>(
	serialize: (...args: A) => string,
	fun: (...args: A) => R
): (...args: A) => R {
	const memory = new Map<string, R>();

	return (...args) => {
		const serializedArgs = serialize(...args);

		if (!memory.has(serializedArgs)) {
			memory.set(serializedArgs, fun(...args));
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return memory.get(serializedArgs)!;
	};
}
