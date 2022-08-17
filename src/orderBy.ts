import { memoize } from "./memoize";

type Iteratee<T> = (value: T) => number;

export function orderBy<T>(
	array: T[],
	iteratees: Iteratee<T>[],
	orders: ("asc" | "desc")[]
): T[] {
	const memoizedIteratees = iteratees.map((iteratee) => memoize(iteratee));

	function compare(a: T, b: T) {
		for (let i = 0; i < memoizedIteratees.length; i++) {
			const valueA = memoizedIteratees[i](a);
			const valueB = memoizedIteratees[i](b);

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
