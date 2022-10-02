import type { ArgsOf } from "discordx";
import { Discord, On, Client } from "discordx";
import CRetrieveNft from "../controllers/CRetrieveNft.js";
import CEmbedBuilder from "../../../main/utilities/embedbuilder/controllers/CEmbedBuilder.js";

/**
 * A event representing the nft retrieve process
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
@Discord()
export abstract class ENftMonitoring {

    /**
     * An event that triggers on bot ready retrieving the nft characters
     *
     * @param {ArgsOf} member
     * @param {Client} client
     */
    @On({ event: "ready" })
    onReady([member]: ArgsOf<"ready">, client: Client) {
        if (client.user?.id != process.env.BOT_ID1)
            return;

        setInterval(function () {
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
                interaction: null
            })).fetch(false).catch(error => {
                console.log(error)
            })
        }, 60000 * 30)

    }
}