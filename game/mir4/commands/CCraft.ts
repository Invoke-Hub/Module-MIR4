import { ApplicationCommandOptionType, ButtonInteraction, ChatInputCommandInteraction, CommandInteraction, ModalSubmitInteraction, TextChannel } from "discord.js"
import { Discord, ModalComponent, ButtonComponent, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx"
import { ICraft, IMaterial, IMaterials } from "../interfaces/ICraft.js";
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

    private _materials: ICraft = {
        dragonMaterial: 1,
        rarity: 1,
        craftingMaterials: {
            uncommon: {} as IMaterial,
            rare: {} as IMaterial,
            epic: {} as IMaterial,
            legendary: {} as IMaterial
        },
        copper: 0,
        darksteel: 0,
        glitteringPowder: 0
    }

    public get materials(): ICraft {
        return this._materials
    }

    public set materials(material) {
        this._materials = material
    }

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
        this.materials.dragonMaterial = dragonMaterial
        this.materials.rarity = rarity
        this.materials.copper = copper
        this.materials.darksteel = darksteel
        this.materials.glitteringPowder = glitteringPowder
        this.materials.interaction = interaction

        this.buildEmbed(null)
    }

    /**
     * Builds an embed display base from materials
     *
     * @param {ModalSubmitInteraction} interaction
     */
    buildEmbed(mode: keyof IMaterials | null, interaction: ButtonInteraction | ModalSubmitInteraction | CommandInteraction | null = null): CEmbedBuilder[] | void {
        let calculator = new CMaterialCalculator(this.materials, new CEmbedBuilder({
            interaction: this.materials.interaction!
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
                    this.materials.interaction!.reply({
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
        this.buildEmbed("uncommon", interaction)
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
        this.buildEmbed("rare", interaction)
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
        this.buildEmbed("epic", interaction)
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
        this.buildEmbed("legendary", interaction)
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
        
        this._materials = {
            dragonMaterial: this.materials.dragonMaterial,
            rarity: this.materials.rarity,
            craftingMaterials: {
                uncommon: {} as IMaterial,
                rare: {} as IMaterial,
                epic: {} as IMaterial,
                legendary: {} as IMaterial
            },
            copper: 0,
            darksteel: 0,
            glitteringPowder: 0
        }

        let data: CEmbedBuilder[] = this.buildEmbed(null, interaction) as CEmbedBuilder[];

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
        interaction.fields.fields.forEach(field => {
            let values = field.customId.split("|")
            let material: keyof IMaterial = values[0] as keyof IMaterial
            let rarity: keyof IMaterials = values[1] as keyof IMaterials

            this.materials.craftingMaterials[rarity][material] = !isNaN(Number(field.value)) ? Number(field.value) : 0
        })

        let data: CEmbedBuilder[] = this.buildEmbed(null, interaction) as CEmbedBuilder[];
        interaction.reply({
            embeds: data,
            files: data[1].files,
            components: data[1].components
        })
    }

}