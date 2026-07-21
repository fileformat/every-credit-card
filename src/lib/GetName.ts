import firstNamesRaw from "../assets/firstnames.txt?raw";
import lastNamesRaw from "../assets/lastnames.txt?raw";

import type { RandomGenerator } from "./SeededRandom";

const parseNames = (raw: string): string[] =>
	raw
		.split(/\r?\n/)
		.map((name) => name.trim())
		.filter(Boolean);

const FIRST_NAMES = parseNames(firstNamesRaw);
const LAST_NAMES = parseNames(lastNamesRaw);

function GetName(random: RandomGenerator): string {
	const firstName = FIRST_NAMES[random.nextInt(0, FIRST_NAMES.length - 1)];
	const lastName = LAST_NAMES[random.nextInt(0, LAST_NAMES.length - 1)];

	return `${firstName} ${lastName}`;
}

export { GetName };
