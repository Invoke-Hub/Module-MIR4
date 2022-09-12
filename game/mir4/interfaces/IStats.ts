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