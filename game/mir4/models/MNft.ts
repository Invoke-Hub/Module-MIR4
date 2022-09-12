import axios, { AxiosResponse } from "axios";
import CEmbedBuilder from "../../../main/utilities/embedbuilder/controllers/CEmbedBuilder";
import { INft, RootObject } from "../interfaces/INft";

/**
 * A class representing the mir4 model
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
export default class MNft {

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

    public get profileUrl(): string {
        return this._profileUrl
    }

    public get listType(): string {
        return this._nft.listType
    }

    public get class(): number {
        return this._nft.class
    }

    public get levMin(): number {
        return this._nft.levMin
    }

    public get levMax(): number {
        return this._nft.levMax
    }

    public get powerMin(): number {
        return this._nft.powerMin
    }

    public get powerMax(): number {
        return this._nft.powerMax
    }

    public get priceMin(): number {
        return this._nft.priceMin
    }

    public get priceMax(): number {
        return this._nft.priceMax
    }

    public get sort(): string {
        return this._nft.sort
    }

    public get page(): number {
        return this._nft.page
    }

    public set page(page) {
        this._nft.page = page
    }

    public get languageCode(): string {
        return this._nft.languageCode
    }

    async requestData(url: string) {
        return await axios.get(url)
    }

    /**
     * Retrieves class name
     *
     * @param {number} classId
     * @return {string} class name for embed
     */
    className(classId: number): string {
        switch (classId) {
            case 1: return "Warrior"
            case 2: return "Sorcerer"
            case 3: return "Taoist"
            case 4: return "Arbalist"
            default: return "Lancer"
        }
    }

    /**
     * Retrieves class emoji
     *
     * @param {number} classId
     * @return {string} class emoji for embed
     */
    classIcon(classId: number): string {
        switch (classId) {
            case 1: return "<:MIR4Warrior:1018060984126013472>"
            case 2: return "<:MIR4Sorcerer:1018060979965276170>"
            case 3: return "<:MIR4Taoist:1018060981961756733>"
            case 4: return "<:MIR4Arbalist:1018060975716454410>"
            default: return "<:MIR4Lancer:1018060977805213696>"
        }
    }

    /**
     * Generates search criteria embed
     *
     * @param {CEmbedBuilder} embed
     */
    searchResult(embed: CEmbedBuilder) {
        embed.addFields({
            name: "ㅤ",
            value: "```SEARCH CRITERIA```",
            inline: false
        })

        Object.entries(this._nft).forEach(entry => {
            let [key, value] = entry
            switch (key) {
                case "listType":
                    key = "List Type";
                    break;
                case "class":
                    key = "Class";
                    value = this.className(value)
                    break;
                case "levMin":
                    key = "Minimum Level";
                    break;
                case "levMax":
                    key = "Maximum Level";
                    break;
                case "powerMin":
                    key = "Minimum PS";
                    break;
                case "powerMax":
                    key = "Maximum PS";
                    break;
                case "priceMin":
                    key = "Minimum Price";
                    break;
                case "priceMax":
                    key = "Maximum Price";
                    break;
                case "sort":
                    key = "Sort";
                    break;
                default: return;
            }

            embed.addFields({
                name: key,
                value: "```" + value + "```",
                inline: true
            })
        })
    }

    /**
     * Generates a url base from the request
     *
     * @return {string} response status translation
     */
    requestList(mode: string, transportID: number = 0): string {
        let data: any;
        switch (mode) {
            case "spirit":
                data = {
                    transportID: transportID,
                    languageCode: this.languageCode,
                    url: this._spiritUrl
                }
                break;
            case "stats":
                data = {
                    transportID: transportID,
                    languageCode: this.languageCode,
                    url: this._statsUrl
                }
                break;
            default:
                data = {
                    listType: this.listType,
                    class: this.class,
                    levMin: this.levMin,
                    levMax: this.levMax,
                    powerMin: this.powerMin,
                    powerMax: this.powerMax,
                    priceMin: this.priceMin,
                    priceMax: this.priceMax,
                    sort: this.sort,
                    page: this.page,
                    languageCode: this.languageCode,
                    url: this._listUrl
                }
                break;

        }

        let query = Object.entries(data).filter(([key]) => key != "url").map(([key, val]) => `${key}=${val}`).join('&');
        return `${data.url}?${query}`;
    }

}