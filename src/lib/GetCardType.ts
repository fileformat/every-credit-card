import type { RandomGenerator } from "./SeededRandom";

type CardType = {
    brand: string;
    prefix: string;
    length: number;
}

const CARD_TYPES: CardType[] = [
    { brand: "amex", prefix: "34", length: 15 },
    { brand: "dinersclub", prefix: "36", length: 14 },
    { brand: "amex", prefix: "37", length: 15 },
    { brand: "dinersclub", prefix: "38", length: 14 },
    { brand: "visa", prefix: "40", length: 16 },
    { brand: "visa", prefix: "41", length: 16 },
    { brand: "visa", prefix: "42", length: 16 },
    { brand: "visa", prefix: "43", length: 16 },
    { brand: "visa", prefix: "44", length: 16 },
    { brand: "visa", prefix: "45", length: 16 },
    { brand: "visa", prefix: "46", length: 16 },
    { brand: "visa", prefix: "47", length: 16 },
    { brand: "visa", prefix: "48", length: 16 },
    { brand: "visa", prefix: "49", length: 16 },
    { brand: "mastercard", prefix: "50", length: 16 },
    { brand: "mastercard", prefix: "51", length: 16 },
    { brand: "mastercard", prefix: "52", length: 16 },
    { brand: "mastercard", prefix: "53", length: 16 },
    { brand: "mastercard", prefix: "54", length: 16 },
    { brand: "mastercard", prefix: "55", length: 16 },
    { brand: "mastercard", prefix: "56", length: 16 },
    { brand: "mastercard", prefix: "57", length: 16 },
    { brand: "mastercard", prefix: "58", length: 16 },
    { brand: "mastercard", prefix: "59", length: 16 },
    { brand: "discover", prefix: "60", length: 16 },
    { brand: "discover", prefix: "65", length: 16 },
    { brand: "jcb", prefix: "35", length: 16 },
];

function GetCardType(rng: RandomGenerator): CardType {
    const index = rng.nextInt(0, CARD_TYPES.length - 1);
    return CARD_TYPES[index];
}


export { GetCardType, type CardType };