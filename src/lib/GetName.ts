import firstNamesRaw from "../assets/firstnames.csv?raw";
import lastNamesRaw from "../assets/lastnames.csv?raw";
import middleInitialsRaw from "../assets/middleinitial.csv?raw";

import type { RandomGenerator } from "./SeededRandom";

type WeightedName = {
	name: string;
	weight: number;
};

const parseWeightedNames = (raw: string): WeightedName[] =>
	raw
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const [name, weightText] = line.split(",");
			const weight = Number.parseInt(weightText ?? "", 10);

			return { name: name.trim(), weight };
		})
		.filter(({ name, weight }) => Boolean(name) && Number.isFinite(weight) && weight > 0);

const pickWeightedName = (random: RandomGenerator, names: WeightedName[]): string => {
	const totalWeight = names.reduce((sum, entry) => sum + entry.weight, 0);
	const target = random.nextFloat() * totalWeight;
	let runningWeight = 0;

	for (const entry of names) {
		runningWeight += entry.weight;

		if (target < runningWeight) {
			return entry.name;
		}
	}

	return names[names.length - 1].name;
};

const FIRST_NAMES = parseWeightedNames(firstNamesRaw);
const LAST_NAMES = parseWeightedNames(lastNamesRaw);
const MIDDLE_INITIALS = parseWeightedNames(middleInitialsRaw);

const FIRST_NAME_SET = new Set(FIRST_NAMES.map(n => n.name.toUpperCase()));
const LAST_NAME_SET = new Set(LAST_NAMES.map(n => n.name.toUpperCase()));

function GetName(random: RandomGenerator): string {
	const firstName = pickWeightedName(random, FIRST_NAMES);
	const lastName = pickWeightedName(random, LAST_NAMES);

	let middleInitial = '';
	if (random.nextFloat() < 0.35) {
		middleInitial = pickWeightedName(random, MIDDLE_INITIALS) + " ";
	}

	return `${firstName} ${middleInitial}${lastName}`;
}

/** Returns true if the query is a valid prefix of at least one "FIRST LAST" name in the dataset. */
function nameExists(query: string): boolean {
	const q = query.trim().toUpperCase();
	if (!q) return false;
	const spaceIdx = q.indexOf(' ');
	if (spaceIdx === -1) {
		for (const name of FIRST_NAME_SET) if (name.startsWith(q)) return true;
		return false;
	}
	const firstPart = q.slice(0, spaceIdx);
	const lastPart = q.slice(spaceIdx + 1);
	if (!FIRST_NAME_SET.has(firstPart)) return false;
	if (lastPart === '') return true;
	for (const name of LAST_NAME_SET) if (name.startsWith(lastPart)) return true;
	return false;
}

export { GetName, nameExists };
