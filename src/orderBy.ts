type Iteratee<T> = (value: T) => number;

export function orderBy<T>(
	array: T[],
	iteratees: Iteratee<T>[],
	orders: ("asc" | "desc")[]
): T[] {
	function compare(a: T, b: T) {
		for (let i = 0; i < iteratees.length; i++) {
			const valueA = iteratees[i](a);
			const valueB = iteratees[i](b);

			if (valueA == valueB) {
				continue;
			} else if (valueA < valueB) {
				return orders[i] === "desc" ? 1 : -1;
			} else if (valueA > valueB) {
				return orders[i] === "desc" ? -1 : 1;
			} else {
				throw new Error(
					`Non comparable values: ${JSON.stringify(
						a
					)} -> ${valueA}, ${JSON.stringify(b)} -> ${valueB} via ${
						iteratees[i]
					}`
				);
			}
		}

		return 0;
	}

	return array.sort(compare);
}
