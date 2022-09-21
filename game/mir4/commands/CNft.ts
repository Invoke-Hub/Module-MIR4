import { ActionRowBuilder, ButtonInteraction, CommandInteraction, MessageActionRowComponentBuilder, ModalBuilder, RestOrArray, SelectMenuBuilder, SelectMenuComponentOptionData, SelectMenuInteraction, TextInputBuilder, TextInputStyle } from "discord.js"
import { ButtonComponent, Discord, SelectMenuComponent, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx"
import { Pagination, PaginationType } from "@discordx/pagination"
import type { MessageOptions } from "discord.js"
import { INft, List } from "../interfaces/INft.js"
import { Spirit } from "../interfaces/ISpirit.js"
import CEmbedBuilder from "../../../main/utilities/embedbuilder/controllers/CEmbedBuilder.js"
import CRetrieveNft from "../controllers/CRetrieveNft.js"
import fs from "fs"
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

    private _filter: INft = {
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
    }

    public get filter(): INft {
        return this._filter
    }

    public set filter(filter) {
        this._filter = filter
    }

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
        @SlashOption({ name: "class", description: "Which class to filter?", required: false })
        playerClass: number = 0,
        @SlashOption({ name: "minimumlevel", description: "Whats the minimum level", required: false })
        minimumLevel: number = 0,
        @SlashOption({ name: "maximumlevel", description: "Whats the maximum level", required: false })
        maximumlevel: number = 0,
        @SlashOption({ name: "minimumps", description: "Whats the minimum power score", required: false })
        minimumps: number = 0,
        @SlashOption({ name: "maximumps", description: "Whats the maximum power score", required: false })
        maximumps: number = 0,
        @SlashOption({ name: "minimumprice", description: "Whats the minimum price", required: false })
        minimumprice: number = 0,
        @SlashOption({ name: "maximumprice", description: "Whats the maximum price", required: false })
        maximumprice: number = 0,
        @SlashChoice({ name: "Latest", value: "latest" })
        @SlashChoice({ name: "Oldest", value: "oldest" })
        @SlashChoice({ name: "Highest Price", value: "pricehigh" })
        @SlashChoice({ name: "Lowest Price", value: "pricelow" })
        @SlashChoice({ name: "Highest Level", value: "lvhigh" })
        @SlashChoice({ name: "Highest PS", value: "pshigh" })
        @SlashOption({ name: "sort", description: "Sort by?", required: false })
        sort: string = "latest",
        @SlashOption({ name: "name", description: "Whats the character name", required: false })
        name: string = "",
        interaction: CommandInteraction
    ): Promise<void> {
        await interaction.deferReply()

        this.filter.class = playerClass
        this.filter.levMin = minimumLevel
        this.filter.levMax = maximumlevel
        this.filter.powerMin = minimumps
        this.filter.powerMax = maximumps
        this.filter.priceMin = minimumprice
        this.filter.priceMax = maximumprice
        this.filter.sort = sort
        this.filter.interaction = interaction
        this.filter.name = name

        this.createFilter()
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

        if (!this.filter.spirits?.length) {
            return interaction.followUp("There are no filtered spirits.")
        }

        interaction.deleteReply()

        this._filter.spirits = []
        this.createFilter()
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
        let file = fs.readFileSync(`${process.cwd()}/src/modules/game/mir4/resources/data/spirits/Spirits-${this.filter.languageCode}.json`, 'utf-8')
        let data = JSON.parse(file.toString())
        let spirits = data as Spirit[]

        const menu = new SelectMenuBuilder()
            .setPlaceholder("Select Spirits to Add")
            .setCustomId("spirit-select-menu")

        spirits.filter(spirit => spirit.grade > 3).filter(spirit => !this.filter.spirits?.includes(spirit.petName)).forEach(spirit => {
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

        this.filter.spirits?.push(spirit)
        this.createFilter()
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

        if (!this.filter.skills?.length) {
            return interaction.followUp("There are no filtered skills.")
        }

        interaction.deleteReply()

        this._filter.skills = []
        this.createFilter()
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
        let nft: MNft = new MNft(this._filter)
        let file = fs.readFileSync(`${process.cwd()}/src/modules/game/mir4/resources/data/skills/${nft.className(this.filter.class)}-${this.filter.languageCode}.json`, 'utf-8')
        let data = JSON.parse(file.toString())
        let skills = data as Skill[]

        const menu = new SelectMenuBuilder()
            .setPlaceholder("Select Skills to Add")
            .setCustomId("skill-select-menu")

        skills.filter(skill => !this.filter.skills?.includes(skill.skillName)).forEach(skill => {
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

        const skill = interaction.values?.[0]
        if (!skill) {
            return interaction.followUp("invalid skill id, select again")
        }

        interaction.deleteReply()

        this.filter.skills?.push(skill)
        this.createFilter()
    }

    /**
     * Creates search criteria
     */
    createFilter() {
        let path: string = `${process.cwd()}/src/modules/game/mir4/resources/data/users/Players-${this.filter.languageCode}.json`;
        if (!fs.existsSync(path))
            fs.createWriteStream(path);

        let file = fs.readFileSync(path, 'utf-8')
        let data = JSON.parse(file.toString())
        let nfts: List[] = data as List[]

        nfts = nfts.filter((nft: List) => {

            if (this.filter.class && nft.class != this.filter.class)
                return false

            if (this.filter.levMin && nft.lv < this.filter.levMin)
                return false

            if (this.filter.levMax && nft.lv > this.filter.levMax)
                return false

            if (this.filter.powerMin && nft.powerScore < this.filter.powerMin)
                return false

            if (this.filter.powerMax && nft.powerScore > this.filter.powerMax)
                return false

            if (this.filter.priceMin && nft.price < this.filter.priceMin)
                return false

            if (this.filter.priceMax && nft.price > this.filter.priceMax)
                return false

            if (this.filter.name && !nft.characterName.includes(this.filter.name))
                return false

            if (this.filter.spirits?.length && nft.spirits && !this.filter.spirits?.every(spirit => nft.spirits.inven.map(owned => owned.petName).includes(spirit)))
                return false

            if (this.filter.skills?.length && nft.skills && !this.filter.skills?.every(skill => nft.skills.filter(owned => owned.skillName == skill && owned.skillLevel >= 8).length > 0))
                return false

            return true
        }).sort((nft1: List, nft2: List) => {
            switch (this.filter.sort) {
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

        if (!this.filter.interaction) {
            return
        }

        if (!nfts.length) {
            this.filter.interaction.followUp("No results found.")
            return
        }

        new Pagination(this.filter.interaction, paginate(this.filter.interaction, nfts, this.filter), {
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
export function paginate(interaction: CommandInteraction, nfts: List[], nft: INft): MessageOptions[] {
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