import firstNamesRaw from "../assets/firstnames.csv?raw";
import lastNamesRaw from "../assets/lastnames.csv?raw";

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

function GetName(random: RandomGenerator): string {
	const firstName = pickWeightedName(random, FIRST_NAMES);
	const lastName = pickWeightedName(random, LAST_NAMES);

	return `${firstName} ${lastName}`;
}

export { GetName };
