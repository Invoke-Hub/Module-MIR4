import CEmbedBuilder from "../../../main/utilities/embedbuilder/controllers/CEmbedBuilder.js"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder } from "discord.js"
import { INft, List } from "../interfaces/INft.js"
import MNft from "../models/MNft.js"

/**
 * A class representing the mir4 nft retrieve controller
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
export default class CRetrieveNft extends MNft {

    private readonly _embed: CEmbedBuilder

    private readonly _builders: CEmbedBuilder[] = []

    constructor(nft: INft, embed: CEmbedBuilder) {
        super(nft)
        this._embed = embed
    }

    public get embed(): CEmbedBuilder {
        return this._embed
    }

    /**
     * Retrieves all nft from all pages
     *
     * @param {boolean} nofity
     */
    async fetch(notify: boolean): Promise<void> {
        this.retrieve({
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
            url: this.listUrl
        }, this.embed, notify)
    }

    /**
     * Distributes and creates an embed of the nfts
     *
     * @param {List[]} nfts
     * @return {CEmbedBuilder[]} returns the embed builder
     */
    execute(nfts: List[]): CEmbedBuilder[] {
        let totalPages: number = Math.ceil(nfts.length / 9)
        let searchEmbed: CEmbedBuilder = new CEmbedBuilder(this._embed.builder)

        searchEmbed.description = `These were the nfts from MIR4. These are sorted according to: ${this.sort} as of ${new Date().toUTCString()}`
        this.searchResult(searchEmbed)

        searchEmbed
            .setTitle(`MIR4 NFT List`)
            .setDescription(searchEmbed.description)
            .setFooter({ text: `Page ${this.page} of ${totalPages}` })
            .setColor("Blue")

        searchEmbed.addFields({
            name: "ㅤ",
            value: "```SEARCH RESULT```",
            inline: false
        })

        nfts.slice((this.page - 1) * 9, this.page * 9).forEach((nft: List) => {
            searchEmbed.addFields({
                name: `${nft.characterName} - ${this.className(nft.class)}${this.classIcon(nft.class)}`,
                value: "```PS: " + nft.powerScore.toLocaleString() + "``` ```WEMIX: " + nft.price.toLocaleString() + "```  ```Lvl: " + nft.lv.toLocaleString() + "``` ↘ [Open Profile](" + this.profileUrl + nft.seq + ")\n\nㅤ",
                inline: true
            })
        })

        let spiritBtn = new ButtonBuilder()
            .setLabel("Search Spirit")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("searchspirit")

        let clearRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
        let searchRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
            .addComponents(spiritBtn)

        searchEmbed.components = [searchRow]

        if (this.class != 0) {
            searchRow.addComponents(
                new ButtonBuilder()
                    .setLabel("Search Skill")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("searchskill")
            )
        }

        this._builders.push(searchEmbed)
        this.createSpiritEmbed(clearRow)
        this.createSkillEmbed(clearRow)

        if (clearRow.components.length > 0)
            searchEmbed.components.push(clearRow)

        return this._builders
    }

    /**
     * Creats an embed of the filtered spirits
     *
     * @param {ActionRowBuilder<MessageActionRowComponentBuilder>} row
     */
    createSpiritEmbed(row: ActionRowBuilder<MessageActionRowComponentBuilder>) {
        if (this.spirits?.length) {
            let spiritEmbed: CEmbedBuilder = new CEmbedBuilder(this._embed.builder)
                .setTitle("Spirit Search Criteria")
                .setDescription("These are the selected spirits to be filtered along with your search criteria. If you wish to remove your filters simply click on reset spirits.\n\n```Selected Spirits```")
                .setColor("Blue")

            this.spirits.slice(0, 24).forEach((spirit: string) => {
                spiritEmbed.addFields({
                    name: `${spirit}`,
                    value: "ㅤ",
                    inline: true
                })
            })

            let spiritBtn = new ButtonBuilder()
                .setLabel("Clear Filtered Spirits")
                .setStyle(ButtonStyle.Danger)
                .setCustomId("clearspirit")

            row.addComponents(spiritBtn)
            this._builders.push(spiritEmbed)
        }
    }

    /**
     * Creats an embed of the filtered skills
     *
     * @param {ActionRowBuilder<MessageActionRowComponentBuilder>} row
     */
    createSkillEmbed(row: ActionRowBuilder<MessageActionRowComponentBuilder>) {
        if (this.skills?.length) {
            let skillEmbed: CEmbedBuilder = new CEmbedBuilder(this._embed.builder)
                .setTitle("Skill Search Criteria")
                .setDescription("These are the selected skills to be filtered along with your search criteria. If you wish to remove your filters simply click on reset skills.\n\n```Selected Skills```")
                .setColor("Blue")

            this.skills.slice(0, 24).forEach((spirit: string) => {
                skillEmbed.addFields({
                    name: `${spirit}`,
                    value: "ㅤ",
                    inline: true
                })
            })

            let skillBtn = new ButtonBuilder()
                .setLabel("Clear Filtered Skills")
                .setStyle(ButtonStyle.Danger)
                .setCustomId("clearskill")

            row.addComponents(skillBtn)
            this._builders.push(skillEmbed)
        }
    }

}