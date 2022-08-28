import seedrandom from "seedrandom";
import { getPattern } from ".";
import words from "./words.json";

const date = new Date(new Date().valueOf() + 24 * 60 * 60 * 1000);

const random = seedrandom(
	`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
);
const word = words[Math.floor(random() * words.length)];

console.log(getPattern(word, "AIRES"));
