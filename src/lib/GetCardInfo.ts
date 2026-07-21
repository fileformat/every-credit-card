import type { RandomGenerator } from "./SeededRandom";

type CardType = "amex" | "dinersclub" | "discover" | "jcb" | "mastercard" | "unionpay" | "visa";

type CardProfile = {
  type: CardType;
  prefixes: string[];
  length: number;
};

type CardInfo = {
  cardType: CardType;
  prefix: string;
  imageUrl: string;
  number: string;
};

const CARD_PROFILES: CardProfile[] = [
  { type: "visa", prefixes: ["4"], length: 16 },
  { type: "mastercard", prefixes: ["51", "52", "53", "54", "55"], length: 16 },
  { type: "amex", prefixes: ["34", "37"], length: 15 },
  { type: "discover", prefixes: ["6011", "65"], length: 16 },
  { type: "dinersclub", prefixes: ["300", "301", "302", "303", "304", "305", "36", "38"], length: 14 },
  { type: "jcb", prefixes: ["35"], length: 16 },
  { type: "unionpay", prefixes: ["62"], length: 16 },
];

const luhnCheckDigit = (payload: string): number => {
  const withTrailingZero = `${payload}0`;
  let sum = 0;

  for (let i = withTrailingZero.length - 1; i >= 0; i--) {
    let digit = Number(withTrailingZero[i]);
    const offsetFromRight = withTrailingZero.length - 1 - i;

    if (offsetFromRight % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
  }

  return (10 - (sum % 10)) % 10;
};

const formatNumber = (digits: string): string => {
  if (digits.length === 15) {
    return `${digits.slice(0, 4)}\u00A0${digits.slice(4, 10)}\u00A0${digits.slice(10, 15)}`;
  }

  if (digits.length === 14) {
    return `${digits.slice(0, 4)}\u00A0${digits.slice(4, 10)}\u00A0${digits.slice(10, 14)}`;
  }

  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join("\u00A0") : digits;
};

function GetCardInfo(random: RandomGenerator): CardInfo {
  const profile = CARD_PROFILES[random.nextInt(0, CARD_PROFILES.length - 1)];
  const prefix = profile.prefixes[random.nextInt(0, profile.prefixes.length - 1)];

  const payloadLength = profile.length - 1;
  const randomDigitsCount = Math.max(0, payloadLength - prefix.length);
  const randomDigits = Array.from({ length: randomDigitsCount }, () => random.nextInt(0, 9)).join("");
  const payload = `${prefix}${randomDigits}`;

  const checkDigit = luhnCheckDigit(payload);
  const number = formatNumber(`${payload}${checkDigit}`);

  return {
    cardType: profile.type,
    prefix,
    imageUrl: `/images/${profile.type}.svg`,
    number,
  };
}

export { GetCardInfo };
export type { CardInfo, CardType };
