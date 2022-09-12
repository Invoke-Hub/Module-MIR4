import axios, { AxiosResponse } from "axios";
import CEmbedBuilder from "../../../main/utilities/embedbuilder/controllers/CEmbedBuilder";
import { INft, RootObject } from "../interfaces/INft";

/**
 * A class representing the mir4 model
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
export default class MSpirit {

    private readonly _nft: INft

    private readonly _listUrl: string = "https://webapi.mir4global.com/nft/lists"

    private readonly _profileUrl: string = "https://www.xdraco.com/nft/trade/"

    private readonly _spiritUrl: string = "https://webapi.mir4global.com/nft/character/spirit"

    private readonly _statsUrl: string = "https://webapi.mir4global.com/nft/character/stats"

    

    constructor(nft: INft) {
        this._nft = nft
    }

    public get listUrl(): string {
        return this._listUrl
    }

   

}