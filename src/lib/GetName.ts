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

const matchOrNull = (part: string, candidates: WeightedName[], random: RandomGenerator): string | null => {
	const matches = candidates.filter(n => n.name.toUpperCase().startsWith(part.toUpperCase()));
	return matches.length > 0 ? pickWeightedName(random, matches) : null;
};

const matchExactOrNull = (part: string, candidates: WeightedName[], random: RandomGenerator): string | null => {
	const matches = candidates.filter(n => n.name.toUpperCase() === part.toUpperCase());
	return matches.length > 0 ? pickWeightedName(random, matches) : null;
};

/** Generates a random full name that starts with the given (possibly partial) text, or null if no name in the dataset matches. */
function GetNameStartingWith(random: RandomGenerator, query: string): string | null {
	const withoutLeadingSpace = query.replace(/^\s+/, '');
	if (!withoutLeadingSpace.trim()) {
		return GetName(random);
	}

	// Any whitespace after the leading spaces means the first name was typed in full.
	const firstNameComplete = /\s/.test(withoutLeadingSpace);
	const words = withoutLeadingSpace.trim().split(/\s+/);

	if (words.length >= 3) {
		const firstName = matchExactOrNull(words[0], FIRST_NAMES, random);
		const middleInitial = matchOrNull(words[1], MIDDLE_INITIALS, random);
		const lastName = matchOrNull(words.slice(2).join(' '), LAST_NAMES, random);
		if (!firstName || !middleInitial || !lastName) return null;
		return `${firstName} ${middleInitial} ${lastName}`;
	}

	const [firstPart, lastPart] = words;
	const firstName = firstNameComplete
		? matchExactOrNull(firstPart, FIRST_NAMES, random)
		: matchOrNull(firstPart, FIRST_NAMES, random);
	if (!firstName) return null;

	if (lastPart) {
		const lastName = matchOrNull(lastPart, LAST_NAMES, random);
		if (!lastName) return null;
		return `${firstName} ${lastName}`;
	}

	const lastName = pickWeightedName(random, LAST_NAMES);
	let middleInitial = '';
	if (random.nextFloat() < 0.35) {
		middleInitial = pickWeightedName(random, MIDDLE_INITIALS) + " ";
	}

	return `${firstName} ${middleInitial}${lastName}`;
}

export { GetName, nameExists, GetNameStartingWith };
