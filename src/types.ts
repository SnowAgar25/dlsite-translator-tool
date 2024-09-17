import { GM_cookie } from '$';

export interface ProductInfo {
    translationTable: any;
    translation_info: {
        is_translation_agree: boolean;
        is_volunteer: boolean;
        original_workno: string | null;
        production_trade_price_rate: number;
    };
    official_price: number;
}

export interface TranslationTable {
    html: string;
}

export interface PriceTableEntry {
    retail: number;
    wholesale: number;
}

export type ProductCache = Record<string, ProductInfo & { translationTable?: string }>;

export type GMCookieType = typeof GM_cookie;