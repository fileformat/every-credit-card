type RememberedCard = {
	name: string;
	cardNumber: string;
	cvv: string;
	expires: string;
	zip: string;
};

// Module-level store so copied cards stay findable across dialog opens without needing React state.
const rememberedCards = new Map<string, RememberedCard>();

function rememberCard(digits: string, card: RememberedCard): void {
	rememberedCards.set(digits, card);
}

function findRememberedCard(digits: string): RememberedCard | null {
	return rememberedCards.get(digits) ?? null;
}

export { rememberCard, findRememberedCard, type RememberedCard };
