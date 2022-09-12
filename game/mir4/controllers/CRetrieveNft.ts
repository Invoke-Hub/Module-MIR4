import CEmbedBuilder from "../../../main/utilities/embedbuilder/controllers/CEmbedBuilder.js";
import CLogger from "../../../main/utilities/logbuilder/controllers/CLogBuilder.js";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, MessageActionRowComponentBuilder } from "discord.js";
import { INft, List, RootObject } from "../interfaces/INft.js";
import axios, { AxiosResponse } from "axios";
import MNft from "../models/MNft.js";
import { Spirit, SpiritObject } from "../interfaces/ISpirit.js";
import { StatsObject } from "../interfaces/IStats.js";
import fs from "fs";

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
            .get(this.requestList("list"))
            .then(async (response: AxiosResponse) => {

                let nfts: RootObject = response.data as RootObject
                let totalPages: number = Math.ceil(nfts.data.totalCount / 20);

                for (let i = 1; i <= totalPages; i++) {
                    console.log(`${i} of ${totalPages}`)

                    this.page = i;

                    await this.requestData(this.requestList("list")).then(async response => {
                        let root: RootObject = response.data as RootObject

                        root.data.lists.forEach(async (nft: List) => {

                            await this.requestData(this.requestList("spirit", nft.transportID)).then(response => {
                                let file = fs.readFileSync(`${process.cwd()}/src/modules/game/mir4/resources/data/spirits/spirits.json`, 'utf-8');
                                let data = null;

                                let modifiedSpirits: Spirit[] = [];
                                let oldSpirits: Spirit[] = [];

                                try {
                                    data = JSON.parse(file.toString());
                                    modifiedSpirits = data as Spirit[];
                                    oldSpirits = Object.assign(oldSpirits, modifiedSpirits)
                                } catch (e) {
                                    data = null;
                                }

                                let spirit: SpiritObject = response.data as SpiritObject
                                nft.spirits = spirit.data;

                                spirit.data.inven.forEach(spirit => {
                                    if (!modifiedSpirits.some(cacheSpirit => cacheSpirit.petName === spirit.petName))
                                        modifiedSpirits.push(spirit)
                                });

                                if (JSON.stringify(modifiedSpirits) != JSON.stringify(oldSpirits)) {
                                    fs.writeFileSync(`${process.cwd()}/src/modules/game/mir4/resources/data/spirits/spirits.json`, JSON.stringify(modifiedSpirits));
                                }
                            })

                            await this.requestData(this.requestList("stats", nft.transportID)).then(response => {
                                let stats: StatsObject = response.data as StatsObject
                                nft.stats = stats.data;
                            })

                        });

                        data = data.concat(root.data.lists);
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

        let skillBtn = new ButtonBuilder()
            .setLabel("Search Skill")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("searchskill");

        let spiritBtn = new ButtonBuilder()
            .setLabel("Search Spirit")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("searchspirit");

        let row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            skillBtn, spiritBtn
        );

        this._embed.components = [row];

        return this._embed
    }

}