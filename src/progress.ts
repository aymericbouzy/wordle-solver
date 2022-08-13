export function* progress<T>(
	process: Iterable<T>,
	operationCount: number
): Iterable<T> {
	let doneCount = 0;
	const start = new Date();

	for (const operation of process) {
		doneCount++;

		const percent = ((doneCount / operationCount) * 100).toFixed(2);
		const estimatedDate = new Date(
			new Date().valueOf() +
				((new Date().valueOf() - start.valueOf()) * operationCount) / doneCount
		);
		console.log(
			`${percent}% (estimated: ${estimatedDate}): ${JSON.stringify(operation)}`
		);
		yield operation;
	}
}
