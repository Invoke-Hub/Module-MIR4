import { CommandInteraction } from "discord.js";
import { Skill } from "./ISkill";
import { Spirits } from "./ISpirit";
import { Stats } from "./IStats";

/**
 * A interface representing mir4 nft properties
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
export interface Stat {
    statName: string;
    statValue: number;
}

export interface List {
    rowID: number;
    seq: number;
    transportID: number;
    nftID: string;
    sealedDT: number;
    characterName: string;
    class: number;
    lv: number;
    powerScore: number;
    price: number;
    MirageScore: number;
    MiraX: number;
    Reinforce: number;
    stat: Stat[];
    spirits: Spirits;
    skills: Skill[];
    stats: Stats;
}

export interface Data {
    firstID: number;
    totalCount: number;
    more: number;
    lists: List[];
}

export interface RootObject {
    code: number;
    data: Data;
}

export interface INft {
    listType: string
    class: number
    levMin: number
    levMax: number
    powerMin: number
    powerMax: number
    priceMin: number
    priceMax: number
    sort: string
    page: number
    languageCode: string
    interaction?: CommandInteraction
    name?: string
    skills?: string[]
    spirits?: string[]
    url?: string
}

export interface INFTSession {
    [uniqueId: string]: INft
}