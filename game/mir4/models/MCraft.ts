import { IMaterials, ICraft, IMaterial } from "../interfaces/ICraft"

/**
 * A class representing the mir4 crafting calculation 
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
export default class MCraft {

    private readonly _craft: ICraft

    private readonly _rarities: (keyof IMaterials)[] = ["uncommon", "rare", "epic", "legendary"]

    private readonly _craftingRequirement: ICraft[] = [{
        dragonMaterial: 0,
        rarity: 1,
        craftingMaterials: {
            uncommon: {
                steel: 30000,
                evilMindedOrb: 10000,
                moonShadowStone: 10000,
                quintessence: 10000,
                exorcismBubble: 10000,
                platinum: 30000,
                illuminatingFragment: 10000,
                animaStone: 10000,
            },
            rare: {
                steel: 3000,
                evilMindedOrb: 1000,
                moonShadowStone: 1000,
                quintessence: 1000,
                exorcismBubble: 1000,
                platinum: 3000,
                illuminatingFragment: 1000,
                animaStone: 1000,
                quantity: 10,
                copper: 2000,
                darksteel: 1000,
                glitteringPowder: 2
            },
            epic: {
                steel: 300,
                evilMindedOrb: 100,
                moonShadowStone: 100,
                quintessence: 100,
                exorcismBubble: 100,
                platinum: 300,
                illuminatingFragment: 100,
                animaStone: 100,
                quantity: 10,
                copper: 20000,
                darksteel: 5000,
                glitteringPowder: 25
            },
            legendary: {}
        },
        copper: 0,
        darksteel: 0,
        glitteringPowder: 0
    }, {
        dragonMaterial: 0,
        rarity: 2,
        craftingMaterials: {
            uncommon: {
                steel: 300000,
                evilMindedOrb: 100000,
                moonShadowStone: 100000,
                quintessence: 100000,
                exorcismBubble: 100000,
                platinum: 300000,
                illuminatingFragment: 100000,
                animaStone: 100000,
            },
            rare: {
                steel: 30000,
                evilMindedOrb: 10000,
                moonShadowStone: 10000,
                quintessence: 10000,
                exorcismBubble: 10000,
                platinum: 30000,
                illuminatingFragment: 10000,
                animaStone: 10000,
                quantity: 10,
                copper: 2000,
                darksteel: 1000,
                glitteringPowder: 2
            },
            epic: {
                steel: 3000,
                evilMindedOrb: 1000,
                moonShadowStone: 1000,
                quintessence: 1000,
                exorcismBubble: 1000,
                platinum: 3000,
                illuminatingFragment: 1000,
                animaStone: 1000,
                quantity: 10,
                copper: 20000,
                darksteel: 5000,
                glitteringPowder: 25
            },
            legendary: {
                steel: 300,
                evilMindedOrb: 100,
                moonShadowStone: 100,
                quintessence: 100,
                exorcismBubble: 100,
                platinum: 300,
                illuminatingFragment: 100,
                animaStone: 100,
                quantity: 10,
                copper: 100000,
                darksteel: 25000,
                glitteringPowder: 125
            }
        },
        copper: 0,
        darksteel: 0,
        glitteringPowder: 0
    }]

    constructor(craft: ICraft) {
        this._craft = craft
    }

    get craft(): ICraft {
        return this._craft
    }

    get rarities(): (keyof IMaterials)[] {
        return this._rarities
    }

    get craftingRequirement(): ICraft[] {
        return this._craftingRequirement
    }

    get dragonMaterial(): string {
        switch (this.craft.dragonMaterial) {
            case 1: return "Dragon Claw";
            case 2: return "Dragon Scale";
            case 3: return "Dragon Leather";
            case 4: return "Dragon Horn";
            default: return "Dragon Eye";
        }
    }

    get requirements(): IMaterials {
        let requirements: IMaterials = {
            uncommon: {} as IMaterial,
            rare: {} as IMaterial,
            epic: {} as IMaterial,
            legendary: {} as IMaterial
        }

        this.rarities.forEach((rarity: keyof IMaterials) => {
            switch (this.craft.dragonMaterial) {
                case 1:
                case 2:
                    requirements[rarity] = {
                        steel: this.craft.craftingMaterials[rarity].steel,
                        evilMindedOrb: this.craft.craftingMaterials[rarity].evilMindedOrb,
                        moonShadowStone: this.craft.craftingMaterials[rarity].moonShadowStone,
                    }
                    break;
                case 3:
                    requirements[rarity] = {
                        steel: this.craft.craftingMaterials[rarity].steel,
                        quintessence: this.craft.craftingMaterials[rarity].quintessence,
                        exorcismBubble: this.craft.craftingMaterials[rarity].exorcismBubble,
                    }
                    break;
                case 4:
                case 5:
                    requirements[rarity] = {
                        platinum: this.craft.craftingMaterials[rarity].platinum,
                        illuminatingFragment: this.craft.craftingMaterials[rarity].illuminatingFragment,
                        animaStone: this.craft.craftingMaterials[rarity].animaStone,
                    }
                    break;
            }
        });

        return requirements
    }

    /**
     * Retrieves readable name
     *
     * @param {string} name
     * @return {string} readable name
     */
    readableName(name: string): string {
        return (name.charAt(0).toUpperCase() + name.slice(1)).replace(/([A-Z])/g, ' $1').trim();
    }

    /**
     * Retrieves readable number
     *
     * @param {string} number
     * @return {string} readable number
     */
    readableNumber(value: number): number {
        return value < 0 ? 0 : value
    }

    /**
     * Retrieves rarity emoji
     *
     * @param {string} material
     * @return {string} rarity emoji for embed
     */
    emojiRarity(name: string): string {
        switch (name) {
            case "epic": return "<:ColorCFR:1006526139566657606>"
            case "rare": return "<:ColorCTB:1006526149788180551>"
            case "uncommon": return "<:ColorCLG:1006526143526080602>"
            default: return "<:ColorCGP:1006526141345058846>"
        }
    }

    /**
     * Retrieves material emoji
     *
     * @param {string} material
     * @return {string} material emoji for embed
     */
    materialIcon(classId: string): string {
        switch (classId) {
            case "copper": return "<:MIR4Copper:1036166457660289104>"
            case "darksteel": return "<:MIR4DarkSteel:1036166459476410478>"
            default: return "<:MIR4GlitteringPowder:1036166462483738674>"
        }
    }

}