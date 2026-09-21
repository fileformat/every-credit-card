import type { RandomGenerator } from "./SeededRandom";
import type { CardBrand } from "./GetCardType";

const pad = (value: number, width: number): string => value.toString().padStart(width, '0');

const getCvv = (random: RandomGenerator, cardBrand: CardBrand): string => {
  if (cardBrand === 'amex') {
    return pad(random.nextInt(0, 9999), 4);
  }

  return pad(random.nextInt(0, 999), 3);
};

const getZip = (random: RandomGenerator): string => pad(random.nextInt(0, 99999), 5);

const getExpires = (random: RandomGenerator): string => {
  const month = pad(random.nextInt(1, 12), 2);
  const year = random.nextInt(26, 36);
  return `${month}/${year}`;
};

export { pad, getCvv, getZip, getExpires };
