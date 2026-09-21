import { CARD_TYPES } from "./GetCardType";
import { isValidLuhn } from "./GetCardInfo";

/** Validates a (possibly partial) card number's digits, returning an error message or null if valid so far. */
function validateCardNumber(digits: string): string | null {
	if (!digits) {
		return null;
	}

	const potentialTypes = CARD_TYPES.filter(
		ct => ct.prefix.startsWith(digits) || digits.startsWith(ct.prefix)
	);

	if (potentialTypes.length === 0) {
		return "Invalid card";
	}

	const matchedType = potentialTypes.find(ct => digits.startsWith(ct.prefix));
	if (!matchedType) {
		// Still typing the prefix; too early to validate length or checksum.
		return null;
	}

	if (digits.length < matchedType.length) {
		return "Too short";
	}

	if (digits.length > matchedType.length) {
		return "Too long";
	}

	return isValidLuhn(digits) ? null : "Invalid card number";
}

export { validateCardNumber };
