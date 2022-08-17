import ms from "ms";

export function* progress<T>(
	process: Iterable<T>,
	operationCount: number
): Iterable<T> {
	let doneCount = 0;
	const start = new Date();

	for (const operation of process) {
		doneCount++;

		const percent = ((doneCount / operationCount) * 100).toFixed(2);
		const elapsed = new Date().valueOf() - start.valueOf();
		const remainingEstimation =
			(elapsed * operationCount) / doneCount - elapsed;

		console.log(
			`${percent}% (elapsed: ${ms(elapsed)}, remaining: ${ms(
				remainingEstimation
			)}): ${JSON.stringify(operation)}`
		);
		yield operation;
	}
}
