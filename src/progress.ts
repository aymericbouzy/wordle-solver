export function* progress<T>(
	process: Iterable<T>,
	operationCount: number
): Iterable<T> {
	let doneCount = 0;
	const start = new Date();

	for (const operation of process) {
		doneCount++;
		console.log(
			`${(doneCount / operationCount) * 100}% (estimated: ${new Date(
				new Date().valueOf() +
					((new Date().valueOf() - start.valueOf()) * operationCount) /
						doneCount
			)})`
		);
		yield operation;
	}
}
