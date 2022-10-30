import { ApplicationCommandOptionType, ButtonInteraction, ChatInputCommandInteraction, CommandInteraction, ModalSubmitInteraction, TextChannel } from "discord.js"
import { Discord, ModalComponent, ButtonComponent, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx"
import { ICraft, ICraftSession, IMaterial, IMaterials } from "../interfaces/ICraft.js";
import CEmbedBuilder from "../../../main/utilities/embedbuilder/controllers/CEmbedBuilder.js";
import CMaterialCalculator from "../controllers/CMaterialCalculator.js"

/**
 * A class that calculates the mir4 material craft calculation
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
@Discord()
@SlashGroup({ description: "Displays mir4 craft calculations", name: "mir4" })
@SlashGroup("mir4")
export abstract class CNft {

    private _filter: ICraftSession = {}

    /**
     * Executes the mir4 craft calculation
     *
     * @param {CommandInteraction} interaction
     */
    @Slash({ name: "craft", description: "Calculates MIR4 Craft materials" })
    async craft(
        @SlashChoice({ name: "Dragon Claw", value: 1 })
        @SlashChoice({ name: "Dragon Scale", value: 2 })
        @SlashChoice({ name: "Dragon Leather", value: 3 })
        @SlashChoice({ name: "Dragon Horn", value: 4 })
        @SlashChoice({ name: "Dragon Eye", value: 5 })
        @SlashOption({ name: "material", description: "Which material to craft?", required: true, type: ApplicationCommandOptionType.Integer })
        dragonMaterial: number = 1,
        @SlashChoice({ name: "Epic", value: 0 })
        @SlashChoice({ name: "Legendary", value: 1 })
        @SlashOption({ name: "rarity", description: "Which rarity to craft?", required: true, type: ApplicationCommandOptionType.Integer })
        rarity: number = 0,
        @SlashOption({ name: "copper", description: "How much Copper do you have?", required: true, type: ApplicationCommandOptionType.Integer })
        copper: number = 0,
        @SlashOption({ name: "darksteel", description: "How much Dark Steel do you have?", required: true, type: ApplicationCommandOptionType.Integer })
        darksteel: number = 0,
        @SlashOption({ name: "glitteringpower", description: "How much Glittering Powder do you have?", required: true, type: ApplicationCommandOptionType.Integer })
        glitteringPowder: number = 0,
        interaction: CommandInteraction
    ): Promise<void> {

        let sessionId: string = this.retrieveSession(interaction);
        this._filter[sessionId] = {
            dragonMaterial: dragonMaterial,
            rarity: rarity,
            craftingMaterials: {
                uncommon: {} as IMaterial,
                rare: {} as IMaterial,
                epic: {} as IMaterial,
                legendary: {} as IMaterial
            },
            copper: copper,
            darksteel: darksteel,
            glitteringPowder: glitteringPowder,
            interaction: interaction
        }

        this.buildEmbed(null, null, this._filter[sessionId])
    }

    /**
     * Builds an embed display base from materials
     *
     * @param {ModalSubmitInteraction} interaction
     */
    buildEmbed(mode: keyof IMaterials | null, interaction: ButtonInteraction | ModalSubmitInteraction | CommandInteraction | null = null, materials:ICraft): CEmbedBuilder[] | void {
        let calculator = new CMaterialCalculator(materials, new CEmbedBuilder({
            interaction: materials.interaction!
        }));

        switch (mode) {
            case "uncommon":
            case "rare":
            case "epic":
            case "legendary":
                return calculator.modal(mode, interaction! as ButtonInteraction);
            default:
                let data: CEmbedBuilder[] = calculator.execute();

                if (interaction instanceof ModalSubmitInteraction || interaction instanceof ButtonInteraction)
                    return data;
                else
                    materials.interaction!.reply({
                        embeds: data,
                        files: data[1].files,
                        components: data[1].components
                    })
        }
    }

    /**
     * Creates a uncommon material modal form
     *
     * @param {ButtonInteraction} interaction
     */
    @ButtonComponent({ id: "btnUncommon" })
    uncommonHandler(
        interaction: ButtonInteraction
    ): void {
        let sessionId: string = this.retrieveSession(interaction);
        this.buildEmbed("uncommon", interaction, this._filter[sessionId])
    }

    /**
     * Creates a rare material modal form
     *
     * @param {ButtonInteraction} interaction
     */
    @ButtonComponent({ id: "btnRare" })
    rareHandler(
        interaction: ButtonInteraction
    ): void {
        let sessionId: string = this.retrieveSession(interaction);
        this.buildEmbed("rare", interaction, this._filter[sessionId])
    }

    /**
     * Creates a epic material modal form
     *
     * @param {ButtonInteraction} interaction
     */
    @ButtonComponent({ id: "btnEpic" })
    epicHandler(
        interaction: ButtonInteraction
    ): void {
        let sessionId: string = this.retrieveSession(interaction);
        this.buildEmbed("epic", interaction, this._filter[sessionId])
    }

    /**
     * Creates a legendary material modal form
     *
     * @param {ButtonInteraction} interaction
     */
    @ButtonComponent({ id: "btnLegendary" })
    legendaryHandler(
        interaction: ButtonInteraction
    ): void {
        let sessionId: string = this.retrieveSession(interaction);
        this.buildEmbed("legendary", interaction, this._filter[sessionId])
    }

    /**
     * Clear session
     *
     * @param {CommandInteraction} interaction
     */
    @ButtonComponent({ id: "btnClear" })
    clearHandler(
        interaction: ButtonInteraction
    ): void {
        let sessionId: string = this.retrieveSession(interaction);
        this._filter[sessionId] = {
            dragonMaterial: this._filter[sessionId].dragonMaterial,
            rarity: this._filter[sessionId].rarity,
            craftingMaterials: {
                uncommon: {} as IMaterial,
                rare: {} as IMaterial,
                epic: {} as IMaterial,
                legendary: {} as IMaterial
            },
            copper: 0,
            darksteel: 0,
            glitteringPowder: 0,
            interaction: this._filter[sessionId].interaction
        }

        let data: CEmbedBuilder[] = this.buildEmbed(null, interaction, this._filter[sessionId]) as CEmbedBuilder[];

        interaction.reply({
            embeds: data,
            files: data[1].files,
            components: data[1].components
        })
    }

    /**
     * Response for craft calculation
     *
     * @param {ModalSubmitInteraction} interaction
     */
    @ModalComponent()
    async CraftingForm(interaction: ModalSubmitInteraction): Promise<void> {
        let sessionId: string = this.retrieveSession(interaction);

        interaction.fields.fields.forEach(field => {
            let values = field.customId.split("|")
            let material: keyof IMaterial = values[0] as keyof IMaterial
            let rarity: keyof IMaterials = values[1] as keyof IMaterials

            this._filter[sessionId].craftingMaterials[rarity][material] = !isNaN(Number(field.value)) ? Number(field.value) : 0
        })

        let data: CEmbedBuilder[] = this.buildEmbed(null, interaction, this._filter[sessionId]) as CEmbedBuilder[];
        interaction.reply({
            embeds: data,
            files: data[1].files,
            components: data[1].components
        })
    }

    /**
     * Retrieves session
     *
     * @param {CommandInteraction | SelectMenuInteraction | ButtonInteractio} interaction 
     * @return string
     */
     private retrieveSession(interaction: CommandInteraction | ModalSubmitInteraction | ButtonInteraction): string {
        return `${interaction.user.id}-${interaction.channelId}`
    }

}