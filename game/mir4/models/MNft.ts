import axios, { AxiosResponse } from "axios"
import { AttachmentBuilder } from "discord.js"
import { INft, List, RootObject } from "../interfaces/INft"
import CEmbedBuilder from "../../../main/utilities/embedbuilder/controllers/CEmbedBuilder.js"
import * as fs from 'fs';
import MSkill from "./MSkill.js"
import MSpirit from "./MSpirit.js"

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

    public get spirits(): string[] | undefined {
        return this._nft.spirits
    }

    public get skills(): string[] | undefined {
        return this._nft.skills
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
                    key = "List Type"
                    break
                case "class":
                    key = "Class"
                    value = this.className(value)
                    break
                case "levMin":
                    key = "Minimum Level"
                    break
                case "levMax":
                    key = "Maximum Level"
                    break
                case "powerMin":
                    key = "Minimum PS"
                    break
                case "powerMax":
                    key = "Maximum PS"
                    break
                case "priceMin":
                    key = "Minimum Price"
                    break
                case "priceMax":
                    key = "Maximum Price"
                    break
                case "sort":
                    key = "Sort"
                    break
                default: return
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
     * @param {any} data object containing url parameters
     * @return {string} response status translation
     */
    requestList(data: any): string {
        let query = Object.entries(data).filter(([key]) => key != "url").map(([key, val]) => `${key}=${val}`).join('&')
        return `${data.url}?${query}`
    }

    /**
     * Retrieves data from MIR4
     *
     * @param {INft} filter applied filters
     * @param {CEmbedBuilder} embed embed builder
     * @param {boolean} notify flag to send embed
     * @return {string} response status translation
     */
    async retrieve(filter: INft, embed: CEmbedBuilder, notify: boolean): Promise<void> {
        let data: List[] = []

        await axios
            .get(this.requestList(filter))
            .then(async (response: AxiosResponse) => {

                let nfts: RootObject = response.data as RootObject
                let totalPages: number = Math.ceil(nfts.data.totalCount / 20)

                let spiritModule: MSpirit = new MSpirit(this)
                let skillModule: MSkill = new MSkill(this)

                for (let i = 1; i <= totalPages; i++) {
                    console.log(`${i} of ${totalPages}`)
                    filter.page = i

                    await this.requestData(this.requestList(filter)).then(async response => {
                        let root: RootObject = response.data as RootObject

                        root.data.lists.forEach(async (nft: List) => {
                            spiritModule.load(nft)
                            skillModule.load(nft)
                        })

                        data = data.concat(root.data.lists)
                    })
                }

                if (notify) {
                    embed.files = [new AttachmentBuilder(`${process.cwd()}/src/modules/game/mir4/resources/images/banner.gif`, { name: 'profile-image.gif' })]
                    embed
                        .setTitle(`MIR4 NFT Retrieve`)
                        .setDescription("Fetched " + nfts.data.totalCount + " NFTs as of " + new Date().toUTCString() + ", CRON will run again after 5 minutes.")
                        .setImage('attachment://profile-image.gif')
                        .setFooter({ text: `${new Date().toUTCString()}` })
                        .setColor("Green")
                        .sendMessage()
                }

            }).catch(error => {
                console.log(error)
            })

        let path: string = `${process.cwd()}/src/modules/game/mir4/resources/data/users/Players-${this.languageCode}.json`;
        if (!fs.existsSync(path))
            fs.createWriteStream(path);

        fs.writeFileSync(path, JSON.stringify(data))
    }

}