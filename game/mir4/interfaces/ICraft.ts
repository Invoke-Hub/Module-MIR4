import { CommandInteraction } from "discord.js"

/**
 * A interface representing mir4 nft properties
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
export interface IMaterial {
    steel?: number | null
    evilMindedOrb?: number | null
    moonShadowStone?: number | null
    quintessence?: number | null
    exorcismBubble?: number | null
    platinum?: number | null
    illuminatingFragment?: number | null
    animaStone?: number | null
    quantity?: number | null,
    copper?: number | null,
    darksteel?: number | null,
    glitteringPowder?: number | null
}

export interface IMaterials {
    uncommon: IMaterial
    rare: IMaterial
    epic: IMaterial
    legendary: IMaterial
}

export interface ICraft {
    dragonMaterial: number
    rarity: number
    craftingMaterials: IMaterials
    copper: number
    darksteel: number
    glitteringPowder: number
    interaction?: CommandInteraction
}