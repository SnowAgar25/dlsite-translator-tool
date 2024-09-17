import { PriceTableEntry } from './types';

const priceTable: PriceTableEntry[] = [
    { retail: 110, wholesale: 53 },
    { retail: 220, wholesale: 107 },
    { retail: 330, wholesale: 161 },
    { retail: 440, wholesale: 215 },
    { retail: 550, wholesale: 269 },
    { retail: 660, wholesale: 323 },
    { retail: 770, wholesale: 431 },
    { retail: 880, wholesale: 485 },
    { retail: 990, wholesale: 539 },
    { retail: 1100, wholesale: 647 },
    { retail: 1210, wholesale: 754 },
    { retail: 1320, wholesale: 862 },
    { retail: 1430, wholesale: 970 },
    { retail: 1540, wholesale: 1024 },
    { retail: 1650, wholesale: 1078 },
    { retail: 1760, wholesale: 1186 },
    { retail: 1870, wholesale: 1294 },
    { retail: 1980, wholesale: 1401 },
    { retail: 2090, wholesale: 1509 },
    { retail: 2200, wholesale: 1563 },
    { retail: 2310, wholesale: 1617 },
    { retail: 2420, wholesale: 1725 },
    { retail: 2530, wholesale: 1833 },
    { retail: 2640, wholesale: 1941 },
    { retail: 2750, wholesale: 2049 },
    { retail: 2860, wholesale: 2102 },
    { retail: 2970, wholesale: 2156 },
    { retail: 3080, wholesale: 2264 },
    { retail: 3190, wholesale: 2372 },
    { retail: 3300, wholesale: 2480 },
    { retail: 3410, wholesale: 2588 },
    { retail: 3520, wholesale: 2642 },
    { retail: 3630, wholesale: 2696 },
    { retail: 3740, wholesale: 2803 },
    { retail: 3850, wholesale: 2911 },
    { retail: 3960, wholesale: 3019 },
    { retail: 4070, wholesale: 3127 },
    { retail: 4180, wholesale: 3235 },
    { retail: 4290, wholesale: 3343 },
];

export function getWholesalePrice(retailPrice: number): number | null {
    if (retailPrice >= 4400) {
        return Math.floor(retailPrice * 0.784);
    }
    const priceRow = priceTable.find(row => row.retail === retailPrice);
    return priceRow ? priceRow.wholesale : null;
}