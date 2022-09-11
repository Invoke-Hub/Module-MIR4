import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import { Pagination, PaginationType,} from "@discordx/pagination";
import type { MessageOptions } from "discord.js";
import { INft, List } from "../interfaces/INft.js";
import CEmbedBuilder from "../../../main/utilities/embedbuilder/controllers/CEmbedBuilder.js";
import CRetrieveNft from "../controllers/CRetrieveNft.js";
import fs from "fs";

/**
 * A class that retrieves the valorant agent profile
 *
 * @author  Devitrax
 * @version 1.0, 03/08/22
 */
@Discord()
@SlashGroup({ description: "Displays the valorant profile", name: "mir4" })
@SlashGroup("mir4")
export abstract class CNft {

    /**
     * Executes the valorant agent profile embed
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
        interaction: CommandInteraction
    ): Promise<void> {
        await interaction.deferReply()
        
        let file = fs.readFileSync(`${process.cwd()}/src/modules/game/mir4/resources/data/users.json`, 'utf-8');
        let data = JSON.parse(file.toString());
        let nfts: List[] = data as List[];

        nfts = nfts.filter((nft:List) => {

            if (playerClass && nft.class != playerClass)
                return false

            if (minimumLevel && nft.lv < minimumLevel)
                return false;

            if (maximumlevel && nft.lv > maximumlevel)
                return false;

            if (minimumps && nft.powerScore < minimumps)
                return false;

            if (maximumps && nft.powerScore > maximumps)
                return false;

            if (minimumprice && nft.price < minimumprice)
                return false;

            if (minimumprice && nft.price > minimumprice)
                return false;

            return true
        }).sort((nft1:List, nft2:List) => {
            switch (sort) {
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
            return 1;
        });

        new Pagination(interaction, paginate(interaction, nfts, {
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
            languageCode: "en"
        }), {
            type: PaginationType.SelectMenu,
        }).send();
    }

    /**
     * Executes the valorant agent profile embed
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
            languageCode: "en"
        }, new CEmbedBuilder({
            interaction: interaction
        })).fetch(true).then((data: List[]) => {
            fs.writeFileSync(`${process.cwd()}/src/modules/game/mir4/resources/data/users.json`, JSON.stringify(data));
        })
    }
}

export function paginate(interaction: CommandInteraction, nfts: List[], nft: INft): MessageOptions[] {
    let totalPages: number = Math.ceil(nfts.length / 9);

    const pages = Array.from(Array(totalPages).keys()).map((i) => {
        nft.page = i + 1
        return new CRetrieveNft(nft, new CEmbedBuilder({
            interaction: interaction
        })).execute(nfts);
    });

    return pages.map((page) => {
        return {
            embeds: [page],
            files: page.files
        };
    });
}