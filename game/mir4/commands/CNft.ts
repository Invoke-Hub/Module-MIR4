import { ActionRowBuilder, ApplicationCommandOptionType, ButtonInteraction, CommandInteraction, MessageActionRowComponentBuilder, SelectMenuBuilder, SelectMenuInteraction } from "discord.js"
import { ButtonComponent, Discord, SelectMenuComponent, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx"
import { Pagination, PaginationType } from "@discordx/pagination"
import { INft, INFTSession, List } from "../interfaces/INft.js"
import { Spirit } from "../interfaces/ISpirit.js"
import CEmbedBuilder from "../../../main/utilities/embedbuilder/controllers/CEmbedBuilder.js"
import CRetrieveNft from "../controllers/CRetrieveNft.js"
import * as fs from 'fs';
import type { BaseMessageOptions } from "discord.js";
import { Skill } from "../interfaces/ISkill.js"
import MNft from "../models/MNft.js"

/**
 * A class that retrieves the mir4 nft data
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
@Discord()
@SlashGroup({ description: "Displays mir4 nft base from filter", name: "mir4" })
@SlashGroup("mir4")
export abstract class CNft {

    private _filter: INFTSession = {}

    /**
     * Executes the mir4 nft search
     *
     * @param {CommandInteraction} interaction
     */
    @Slash({ name: "nft", description: "Displays mir4 nft list" })
    async retrieve(
        @SlashChoice({ name: "All", value: 0 })
        @SlashChoice({ name: "Warrior", value: 1 })
        @SlashChoice({ name: "Sorcerer", value: 2 })
        @SlashChoice({ name: "Taoist", value: 3 })
        @SlashChoice({ name: "Arbalist", value: 4 })
        @SlashChoice({ name: "Lancer", value: 5 })
        @SlashOption({ name: "class", description: "Which class to filter?", required: false, type: ApplicationCommandOptionType.Integer })
        playerClass: number = 0,
        @SlashOption({ name: "minimumlevel", description: "Whats the minimum level", required: false, type: ApplicationCommandOptionType.Integer })
        minimumLevel: number = 0,
        @SlashOption({ name: "maximumlevel", description: "Whats the maximum level", required: false, type: ApplicationCommandOptionType.Integer })
        maximumlevel: number = 0,
        @SlashOption({ name: "minimumps", description: "Whats the minimum power score", required: false, type: ApplicationCommandOptionType.Integer })
        minimumps: number = 0,
        @SlashOption({ name: "maximumps", description: "Whats the maximum power score", required: false, type: ApplicationCommandOptionType.Integer })
        maximumps: number = 0,
        @SlashOption({ name: "minimumprice", description: "Whats the minimum price", required: false, type: ApplicationCommandOptionType.Integer })
        minimumprice: number = 0,
        @SlashOption({ name: "maximumprice", description: "Whats the maximum price", required: false, type: ApplicationCommandOptionType.Integer })
        maximumprice: number = 0,
        @SlashChoice({ name: "Latest", value: "latest" })
        @SlashChoice({ name: "Oldest", value: "oldest" })
        @SlashChoice({ name: "Highest Price", value: "pricehigh" })
        @SlashChoice({ name: "Lowest Price", value: "pricelow" })
        @SlashChoice({ name: "Highest Level", value: "lvhigh" })
        @SlashChoice({ name: "Highest PS", value: "pshigh" })
        @SlashOption({ name: "sort", description: "Sort by?", required: false, type: ApplicationCommandOptionType.String })
        sort: string = "latest",
        @SlashOption({ name: "name", description: "Whats the character name", required: false, type: ApplicationCommandOptionType.String })
        name: string = "",
        interaction: CommandInteraction
    ): Promise<void> {
        await interaction.deferReply()

        let sessionId: string = this.retrieveSession(interaction);
        this._filter[sessionId] = {
            listType: "sale",
            class: playerClass,
            levMin: minimumLevel,
            levMax: maximumlevel,
            powerMin: minimumps,
            powerMax: maximumps,
            priceMin: minimumprice,
            priceMax: maximumprice,
            sort: sort,
            page: 1,
            languageCode: "en",
            name: name,
            skills: [],
            spirits: [],
            interaction: interaction
        }

        this.createFilter(this._filter[sessionId])
    }

    /**
     * Executes mir4 nft data retrieve
     *
     * @param {CommandInteraction} interaction
     */
    @Slash({ name: "cache", description: "Displays mir4 nft list" })
    async cache(
        interaction: CommandInteraction
    ): Promise<void> {
        await interaction.deferReply()

        new CRetrieveNft({
            listType: "sale",
            class: 0,
            levMin: 0,
            levMax: 0,
            powerMin: 0,
            powerMax: 0,
            priceMin: 0,
            priceMax: 0,
            sort: "latest",
            page: 1,
            languageCode: "en",
            name: "",
            skills: [],
            spirits: []
        }, new CEmbedBuilder({
            interaction: interaction
        })).fetch(true);
    }

    /**
     * Clears spirit filter
     *
     * @param {CommandInteraction} interaction
     */
    @ButtonComponent({ id: "clearspirit" })
    async clearSpiritHandler(
        interaction: ButtonInteraction
    ): Promise<unknown> {
        await interaction.deferReply()

        let sessionId: string = this.retrieveSession(interaction);
        if (!this._filter[sessionId].spirits?.length) {
            return interaction.followUp("There are no filtered spirits.")
        }

        interaction.deleteReply()

        this._filter[sessionId].spirits = []
        this.createFilter(this._filter[sessionId])
    }

    /**
     * Creates a select menu of spirits
     *
     * @param {CommandInteraction} interaction
     */
    @ButtonComponent({ id: "searchspirit" })
    spiritHandler(
        interaction: ButtonInteraction
    ): void {
        let sessionId: string = this.retrieveSession(interaction);
        let file = fs.readFileSync(`${process.cwd()}/src/modules/game/mir4/resources/data/spirits/Spirits-${this._filter[sessionId].languageCode}.json`, 'utf-8')
        let data = JSON.parse(file.toString())
        let spirits = data as Spirit[]

        const menu = new SelectMenuBuilder()
            .setPlaceholder("Select Spirits to Add")
            .setCustomId("spirit-select-menu")

        spirits.filter(spirit => spirit.grade > 3).filter(spirit => !this._filter[sessionId].spirits?.includes(spirit.petName)).slice(0, 25).forEach(spirit => {
            menu.addOptions({
                label: spirit.petName,
                value: spirit.petName.trim()
            })
        })

        const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            menu
        )

        interaction.reply({
            components: [buttonRow],
        })
        setTimeout(() => interaction.deleteReply(), 10000)
    }

    /**
     * Response for spirit select menu
     *
     * @param {SelectMenuInteraction} interaction
     */
    @SelectMenuComponent({ id: "spirit-select-menu" })
    async spiritMenuHandle(
        interaction: SelectMenuInteraction
    ): Promise<unknown> {
        await interaction.deferReply()

        const spirit = interaction.values?.[0]
        if (!spirit) {
            return interaction.followUp("invalid spirit id, select again")
        }

        interaction.deleteReply()

        let sessionId: string = this.retrieveSession(interaction);
        this._filter[sessionId].spirits?.push(spirit)
        this.createFilter(this._filter[sessionId])
    }

    /**
     * Clears skill filter
     *
     * @param {CommandInteraction} interaction
     */
    @ButtonComponent({ id: "clearskill" })
    async clearSkillHandler(
        interaction: ButtonInteraction
    ): Promise<unknown> {
        await interaction.deferReply()
        let sessionId: string = this.retrieveSession(interaction);

        if (!this._filter[sessionId].skills?.length) {
            return interaction.followUp("There are no filtered skills.")
        }

        interaction.deleteReply()

        this._filter[sessionId].skills = []
        this.createFilter(this._filter[sessionId])
    }

    /**
     * Creates a select menu of skills
     *
     * @param {CommandInteraction} interaction
     */
    @ButtonComponent({ id: "searchskill" })
    skillHandler(
        interaction: ButtonInteraction
    ): void {
        let sessionId: string = this.retrieveSession(interaction);
        let nft: MNft = new MNft(this._filter[sessionId])
        let file = fs.readFileSync(`${process.cwd()}/src/modules/game/mir4/resources/data/skills/${nft.className(this._filter[sessionId].class)}-${this._filter[sessionId].languageCode}.json`, 'utf-8')
        let data = JSON.parse(file.toString())
        let skills = data as Skill[]

        const menu = new SelectMenuBuilder()
            .setPlaceholder("Select Skills to Add")
            .setCustomId("skill-select-menu")

        skills.filter(skill => !this._filter[sessionId].skills?.includes(skill.skillName)).forEach(skill => {
            menu.addOptions({
                label: skill.skillName,
                value: skill.skillName.trim()
            })
        })

        const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            menu
        )

        interaction.reply({
            components: [buttonRow],
        })
        setTimeout(() => interaction.deleteReply(), 10000)
    }

    /**
     * Response for skill select menu
     *
     * @param {SelectMenuInteraction} interaction
     */
    @SelectMenuComponent({ id: "skill-select-menu" })
    async skillMenuHandle(
        interaction: SelectMenuInteraction
    ): Promise<unknown> {
        await interaction.deferReply()
        let sessionId: string = this.retrieveSession(interaction);

        const skill = interaction.values?.[0]
        if (!skill) {
            return interaction.followUp("invalid skill id, select again")
        }

        interaction.deleteReply()

        this._filter[sessionId].skills?.push(skill)
        this.createFilter(this._filter[sessionId])
    }

    /**
     * Retrieves session
     *
     * @param {CommandInteraction | SelectMenuInteraction | ButtonInteractio} interaction 
     * @return string
     */
    private retrieveSession(interaction: CommandInteraction | SelectMenuInteraction | ButtonInteraction): string {
        return `${interaction.user.id}-${interaction.channelId}`
    }

    /**
     * Creates search criteria
     */
    createFilter(filter: INft) {
        let path: string = `${process.cwd()}/src/modules/game/mir4/resources/data/users/Players-${filter.languageCode}.json`;
        if (!fs.existsSync(path))
            fs.createWriteStream(path);

        let file = fs.readFileSync(path, 'utf-8')
        let data = JSON.parse(file.toString())
        let nfts: List[] = data as List[]

        nfts = nfts.filter((nft: List) => {

            if (filter.class && nft.class != filter.class)
                return false

            if (filter.levMin && nft.lv < filter.levMin)
                return false

            if (filter.levMax && nft.lv > filter.levMax)
                return false

            if (filter.powerMin && nft.powerScore < filter.powerMin)
                return false

            if (filter.powerMax && nft.powerScore > filter.powerMax)
                return false

            if (filter.priceMin && nft.price < filter.priceMin)
                return false

            if (filter.priceMax && nft.price > filter.priceMax)
                return false

            if (filter.name && !nft.characterName.includes(filter.name))
                return false

            if (filter.spirits?.length && !filter.spirits?.every(spirit => (nft.spirits ? nft.spirits.inven.map(owned => owned.petName) : []).includes(spirit)))
                return false

            if (filter.skills?.length && nft.skills && !filter.skills?.every(skill => (nft.skills ? nft.skills.filter(owned => owned.skillName == skill && owned.skillLevel >= 8) : []).length > 0))
                return false

            return true
        }).sort((nft1: List, nft2: List) => {
            switch (filter.sort) {
                case "latest":
                    return nft1.seq <= nft2.seq ? 1 : -1
                case "oldest":
                    return nft1.seq >= nft2.seq ? 1 : -1
                case "pricehigh":
                    return nft1.price <= nft2.price ? 1 : -1
                case "pricelow":
                    return nft1.price >= nft2.price ? 1 : -1
                case "lvhigh":
                    return nft1.lv <= nft2.lv ? 1 : -1
                case "pshigh":
                    return nft1.powerScore <= nft2.powerScore ? 1 : -1
            }
            return 1
        })

        if (!filter.interaction) {
            return
        }

        if (!nfts.length) {
            filter.interaction.followUp("No results found.")
            return
        }

        new Pagination(filter.interaction, paginate(filter.interaction, nfts, filter), {
            type: PaginationType.SelectMenu,
        }).send()
    }
}

/**
 * Executes mir4 nft data retrieve
 *
 * @param {CommandInteraction} interaction
 * @param {List[]} nfts
 * @param {INft} nft
 * @return {MessageOptions[]} returns a paginated message options
 */
export function paginate(interaction: CommandInteraction, nfts: List[], nft: INft): BaseMessageOptions[] {
    let totalPages: number = Math.ceil(nfts.length / 9)

    const pages = Array.from(Array(totalPages).keys()).map((i) => {
        nft.page = i + 1
        return new CRetrieveNft(nft, new CEmbedBuilder({
            interaction: interaction
        })).execute(nfts)
    })

    return pages.map((page) => {
        return {
            embeds: page,
            components: page[0].components,
            files: page[0].files
        }
    })
}