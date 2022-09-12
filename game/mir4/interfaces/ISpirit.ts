export interface Spirit {
    transcend: number;
    grade: number;
    petName: string;
    petOrigin: string;
    iconPath: string;
}

export interface Equip {
    1: Spirit;
    2: Spirit;
    5: Spirit;
    3: Spirit;
    4: Spirit;
}

export interface Spirits {
    equip: Equip;
    inven: Spirit[];
}

export interface SpiritObject {
    code: number;
    data: Spirits;
}