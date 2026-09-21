import type { RandomGenerator } from "./SeededRandom";
import { GetCardType, CARD_TYPES, type CardBrand } from "./GetCardType";


type CardInfo = {
  cardBrand: CardBrand;
  prefix: string;
  imageUrl: string;
  number: string;
};

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

const isValidLuhn = (digits: string): boolean => {
  const payload = digits.slice(0, -1);
  const checkDigit = Number(digits.slice(-1));
  return luhnCheckDigit(payload) === checkDigit;
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

/** Formats a (possibly partial) card number's digits for display in an editable input. */
const formatCardNumberInput = (digits: string): string => {
  const matchedType = CARD_TYPES.find(ct => digits.startsWith(ct.prefix));

  if (matchedType && (matchedType.length === 14 || matchedType.length === 15)) {
    const groups = [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, matchedType.length)];
    return groups.filter(Boolean).join(" ");
  }

  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(" ") : digits;
};

function GetCardInfo(random: RandomGenerator): CardInfo {
  const cardType = GetCardType(random);
  const prefix = cardType.prefix;

  const payloadLength = cardType.length - 1;
  const randomDigitsCount = Math.max(0, payloadLength - prefix.length);
  const randomDigits = Array.from({ length: randomDigitsCount }, () => random.nextInt(0, 9)).join("");
  const payload = `${prefix}${randomDigits}`;

  const checkDigit = luhnCheckDigit(payload);
  const number = formatNumber(`${payload}${checkDigit}`);

  return {
    cardBrand: cardType.brand,
    prefix,
    imageUrl: `/images/${cardType.brand}.svg`,
    number,
  };
}

export { GetCardInfo, isValidLuhn, formatCardNumberInput, type CardBrand };