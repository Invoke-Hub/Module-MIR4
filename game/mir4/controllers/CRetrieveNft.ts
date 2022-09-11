import CEmbedBuilder from "../../../main/utilities/embedbuilder/controllers/CEmbedBuilder.js";
import CLogger from "../../../main/utilities/logbuilder/controllers/CLogBuilder.js";
import { AttachmentBuilder } from "discord.js";
import { INft, List, RootObject } from "../interfaces/INft.js";
import axios, { AxiosResponse } from "axios";
import MNft from "../models/MNft.js";

/**
 * A class representing the mir4 nft retrieve controller
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
export default class CRetrieveNft extends MNft {

    private readonly _embed: CEmbedBuilder

    constructor(nft: INft, embed: CEmbedBuilder) {
        super(nft);
        this._embed = embed
    }

    public get embed(): CEmbedBuilder {
        return this._embed
    }

    /**
     * Retrieves all nft from all pages
     *
     * @param {boolean} nofity
     * @return {Promise<List[]>} returns the nft characters
     */
    async fetch(notify: boolean): Promise<List[]> {
        let data: List[] = [];

        await axios
            .get(this.requestList())
            .then(async (response: AxiosResponse) => {

                let nfts: RootObject = response.data as RootObject
                let totalPages: number = Math.ceil(nfts.data.totalCount / 20);

                for (let i = 1; i <= totalPages; i++) {
                    // console.log(`Retrieving: ${i} / ${totalPages}`)
                    this.page = i;
                    await axios
                        .get(this.requestList())
                        .then((response: AxiosResponse) => {
                            if (response.status != 200) {
                                CLogger.error(`Retrieve Nft site is currently down.`)
                                return
                            }

                            let nfts: RootObject = response.data as RootObject
                            data = data.concat(nfts.data.lists);

                        }).catch(error => {
                            CLogger.error(`Unable to retrieve NFT, site is probably down.`)
                        })
                }

                if (notify) {
                    this._embed.files = [new AttachmentBuilder(`${process.cwd()}/src/modules/game/mir4/resources/images/banner.gif`, { name: 'profile-image.gif' })]
                    this._embed
                        .setTitle(`MIR4 NFT Retrieve`)
                        .setDescription("Fetched " + nfts.data.totalCount + " NFTs as of " + new Date().toUTCString() + ", CRON will run again after 30 minutes.")
                        .setImage('attachment://profile-image.gif')
                        .setFooter({ text: `${new Date().toUTCString()}` })
                        .setColor("Green")
                }

            }).catch(error => {
                console.log(error);
                CLogger.error(`Unable to retrieve NFT, site is probably down.`)
            })

        return data
    }

    /**
     * Distributes and creates an embed of the nfts
     *
     * @param {List[]} nfts
     * @return {CEmbedBuilder} returns the embed builder
     */
    execute(nfts: List[]): CEmbedBuilder {
        let totalPages: number = Math.ceil(nfts.length / 9);
        this._embed.description = `These were the nfts from MIR4. These are sorted according to: ${this.sort} as of ${new Date().toUTCString()}`;
        this.searchResult(this._embed)

        this._embed
            .setTitle(`MIR4 NFT List`)
            .setDescription(this._embed.description)
            .setFooter({ text: `Page ${this.page} of ${totalPages}` })
            .setColor("Blue")

        this._embed.addFields({
            name: "ㅤ",
            value: "```SEARCH RESULT```",
            inline: false
        })

        nfts.slice((this.page - 1) * 9, this.page * 9).forEach((nft: List) => {
            this._embed.addFields({
                name: `${nft.characterName} - ${this.className(nft.class)}${this.classIcon(nft.class)}`,
                value: "```PS: " + nft.powerScore.toLocaleString() + "``` ```WEMIX: " + nft.price.toLocaleString() + "```  ```Lvl: " + nft.lv.toLocaleString() + "``` ↘ [Open Profile](" + this.profileUrl + nft.seq + ")\n\nㅤ",
                inline: true
            })
        })

        return this._embed
    }

}