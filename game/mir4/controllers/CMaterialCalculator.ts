import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageActionRowComponentBuilder, ButtonInteraction, APIEmbedField, AttachmentBuilder } from "discord.js";
import { ICraft, IMaterial, IMaterials } from "../interfaces/ICraft.js"
import CEmbedBuilder from "../../../main/utilities/embedbuilder/controllers/CEmbedBuilder.js";
import MCraft from "../models/MCraft.js"

/**
 * A class representing the mir4 nft retrieve controller
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
export default class CMaterialCalculator extends MCraft {

    private readonly _embed: CEmbedBuilder

    private readonly _builders: CEmbedBuilder[] = []

    constructor(craft: ICraft, embed: CEmbedBuilder) {
        super(craft)
        this._embed = embed;
    }

    public get embed(): CEmbedBuilder {
        return this._embed
    }

    /**
     * Creates an embed base from crated item
     *
     * @return {CEmbedBuilder[]} returns the embed builder
     */
    execute(): CEmbedBuilder[] {
        let currencyEmbed: CEmbedBuilder = new CEmbedBuilder(this._embed.builder)
            .setTitle(`Devil Dampyo`)
            .setDescription(`Hey lets craft! I see you have choosen the material **${this.dragonMaterial}**, Lets start adding your materials and see what you lack!`)
            .setColor("Blue")
            .setThumbnail('attachment://profile-image.png')

        let oFields: APIEmbedField[] = [];
        let rFields: APIEmbedField[] = [];

        this.rarities.reverse().forEach((rarity: keyof IMaterials) => {

            let rMaterial: IMaterial = this.craftingRequirement[this.craft.rarity].craftingMaterials[rarity]
            let oMaterial: IMaterial = this.craft.craftingMaterials[rarity];

            Object.keys(this.craftingRequirement[this.craft.rarity].craftingMaterials[rarity]).forEach((material: string) => {
                let oItem: keyof IMaterial = material as keyof IMaterial;

                if (oMaterial[oItem] && rMaterial[oItem]) {
                    let craftedMaterial: number = 0;
                    let requiredMaterial: number = rMaterial[oItem]! - oMaterial[oItem]!;

                    switch (rarity) {
                        case "uncommon":
                            craftedMaterial += this.craft.craftingMaterials["rare"][oItem] ? this.craft.craftingMaterials["rare"][oItem]! * 10 : 0
                            craftedMaterial += this.craft.craftingMaterials["epic"][oItem] ? this.craft.craftingMaterials["epic"][oItem]! * 100 : 0
                            craftedMaterial += this.craft.craftingMaterials["legendary"][oItem] && this.craft.rarity == 1 ? this.craft.craftingMaterials["legendary"][oItem]! * 1000 : 0
                            break;
                        case "rare":
                            craftedMaterial += this.craft.craftingMaterials["epic"][oItem] ? this.craft.craftingMaterials["epic"][oItem]! * 10 : 0
                            craftedMaterial += this.craft.craftingMaterials["legendary"][oItem] && this.craft.rarity == 1 ? this.craft.craftingMaterials["epic"][oItem]! * 100 : 0
                            break;
                        case "epic":
                            craftedMaterial += this.craft.craftingMaterials["legendary"][oItem] && this.craft.rarity == 1 ? this.craft.craftingMaterials["legendary"][oItem]! * 10 : 0
                            break;
                    }
                    craftedMaterial = (requiredMaterial - craftedMaterial);
                    
                    if (rMaterial.copper) {
                        this.craftingRequirement[this.craft.rarity].copper += rMaterial.copper * craftedMaterial
                    }

                    if (rMaterial.darksteel)
                        this.craftingRequirement[this.craft.rarity].darksteel += rMaterial.darksteel * craftedMaterial

                    if (rMaterial.glitteringPowder)
                        this.craftingRequirement[this.craft.rarity].glitteringPowder += rMaterial.glitteringPowder * craftedMaterial

                    oFields.push({
                        name: `${this.readableName(oItem)} ${this.emojiRarity(rarity)}`,
                        value: "```" + this.readableName(rarity) + "``` ```x" + this.readableNumber(oMaterial[oItem]!).toLocaleString() + "```",
                        inline: true
                    })

                    rFields.push({
                        name: `${this.readableName(oItem)} ${this.emojiRarity(rarity)}`,
                        value: "```" + this.readableName(rarity) + "``` ```x" + this.readableNumber(craftedMaterial).toLocaleString() + "```",
                        inline: true
                    })
                }
            })
        })

        currencyEmbed.addFields({
            name: "ㅤ",
            value: "```OWNED CURRENCY```",
            inline: false
        }).addFields({
            name: `Copper ${this.materialIcon("copper")}`,
            value: "```" + this.readableNumber(this.craft.copper).toLocaleString() + "```",
            inline: true
        }).addFields({
            name: `Dark Steel ${this.materialIcon("darksteel")}`,
            value: "```" + this.readableNumber(this.craft.darksteel).toLocaleString() + "```",
            inline: true
        }).addFields({
            name: `Glittering Powder ${this.materialIcon("glitteringpowder")}`,
            value: "```" + this.readableNumber(this.craft.glitteringPowder).toLocaleString() + "```",
            inline: true
        }).addFields({
            name: "ㅤ",
            value: "```REQUIRED CURERENCY```",
            inline: false
        }).addFields({
            name: `Copper ${this.materialIcon("copper")}`,
            value: "```" + (this.readableNumber(this.craftingRequirement[this.craft.rarity].copper - this.craft.copper)).toLocaleString() + "```",
            inline: true
        }).addFields({
            name: `Dark Steel ${this.materialIcon("darksteel")}`,
            value: "```" + (this.readableNumber(this.craftingRequirement[this.craft.rarity].darksteel - this.craft.darksteel)).toLocaleString() + "```",
            inline: true
        }).addFields({
            name: `Glittering Powder ${this.materialIcon("glitteringpowder")}`,
            value: "```" + (this.readableNumber(this.craftingRequirement[this.craft.rarity].glitteringPowder - this.craft.glitteringPowder)).toLocaleString() + "```",
            inline: true
        })
        this._builders.push(currencyEmbed);

        let materialEmbed: CEmbedBuilder = new CEmbedBuilder(this._embed.builder)
            .setDescription("Below are the owned and required materials for **" + this.dragonMaterial + "**, I have sorted them out for you to see it clearly.\n\n```OWNED MATERIALS```")
            .setFooter({ text: `Dampyo`, iconURL: "https://www.dampyo.com/_next/image?url=%2Fimages%2Fdampyo.png&w=256&q=75" })
            .setColor("Blue")
        
        materialEmbed.files = [new AttachmentBuilder(`${process.cwd()}/src/modules/game/mir4/resources/images/MIR4Dampyo.png`, { name: 'profile-image.png' })]

        materialEmbed.addFields(oFields).addFields({
            name: "ㅤ",
            value: "```REQUIRED MATERIALS```",
            inline: false
        }).addFields(rFields)

        let optionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
            .addComponents(new ButtonBuilder()
                .setLabel("Add Uncommon")
                .setStyle(ButtonStyle.Success)
                .setCustomId("btnUncommon"))
            .addComponents(new ButtonBuilder()
                .setLabel("Add Rare")
                .setStyle(ButtonStyle.Primary)
                .setCustomId("btnRare"))
            .addComponents(new ButtonBuilder()
                .setLabel("Add Epic")
                .setStyle(ButtonStyle.Danger)
                .setCustomId("btnEpic"))

        if (this.craft.rarity == 1) {
            optionRow.addComponents(new ButtonBuilder()
                .setLabel("Add Legendary")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("btnLegendary"))
        }

        let clearRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
            .addComponents(new ButtonBuilder()
                .setLabel("Clear Session")
                .setStyle(ButtonStyle.Danger)
                .setCustomId("btnClear"))

        materialEmbed.components = [optionRow, clearRow]
        this._builders.push(materialEmbed)

        return this._builders
    }

    /**
     * Creates a modal form base from crafted item
     *
     * @param {keyof IMaterials} type rerity type
     * @param {ButtonInteraction} interaction discord interaction
     */
    modal(type: keyof IMaterials, interaction: ButtonInteraction): void {
        const modal = new ModalBuilder()
            .setTitle(`Craft ${this.dragonMaterial}`)
            .setCustomId("CraftingForm");

        Object.keys(this.requirements[type]).slice(0, 3).filter(material => material != null).forEach((material: string) => {
            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(new TextInputBuilder()
                        .setCustomId(`${material}|${type}`)
                        .setLabel(`${this.readableName(material)} (${type})`)
                        .setStyle(TextInputStyle.Short)));
        })

        interaction.showModal(modal);
    }

}