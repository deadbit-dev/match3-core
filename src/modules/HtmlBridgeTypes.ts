export type CbResultVal = (success: boolean) => void;
export type CbResultData = (status: boolean, data?: any) => void;
export type CbResultDataType<T> = (status: boolean, data: T) => void;

export enum INTERSTITIAL_STATE {
    LOADING,
    OPENED,
    CLOSED,
    FAILED
}

export enum REWARDED_STATE {
    LOADING,
    OPENED,
    CLOSED,
    FAILED,
    REWARDED
}

export enum BANNER_STATE {
    LOADING,
    SHOWN,
    HIDDEN,
    FAILED
}


export interface LeaderboardItem {
    id: string,
    score: number,
    rank: number,
    name: string,
    photos: string[],
    extraData?: string,
    isUser: boolean
}


export interface Purchase {
    productID: string;
    purchaseToken: string;
    developerPayload?: string;
    signature: string;
}

export interface Product {
    id: string;
    title: string;
    description: string;
    imageURI: string;
    price: string;
    priceValue: string;
    priceCurrencyCode: string;
}

export type CbLeaderboardList = (result: boolean, list: LeaderboardItem[]) => void;
export type CbVisibleState = (visible: boolean) => void;
export type CbInterstitialState = (state: INTERSTITIAL_STATE) => void;
export type CbRewardedState = (state: REWARDED_STATE) => void;
export type CbBannerState = (state: BANNER_STATE) => void;


export interface IFlags {
    [key: string]: string;
}

export interface ClientFeature {
    name: string;
    value: string;
}

export interface IGetFlagsParams {
    defaultFlags?: IFlags;
    clientFeatures?: ClientFeature[];
}