/**
 * A interface representing mir4 nft properties
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
export interface List {
    statName: string;
    statValue: string;
    iconPath: string;
}

export interface Mainstat {
    statName: string;
    statValue: string;
    iconPath: string;
}

export interface Stats {
    lists: List[];
    mainstats: Mainstat[];
}

export interface StatsObject {
    code: number;
    data: Stats;
}