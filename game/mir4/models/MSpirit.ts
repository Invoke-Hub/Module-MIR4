import { List } from "../interfaces/INft";
import { Spirit, SpiritObject } from "../interfaces/ISpirit";
import fs from "fs"
import MNft from "./MNft.js";

/**
 * A class representing the mir4 model
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
export default class MSpirit {

    private readonly _spiritUrl: string = "https://webapi.mir4global.com/nft/character/spirit"

    private readonly _nft: MNft

    constructor(nft: MNft) {
        this._nft = nft
    }

    /**
     * Retrieves data from MIR4
     *
     * @param {List} list data gathered from mir4 api
     */
    async load(list: List) {
        await this._nft.requestData(this._nft.requestList({
            transportID: list.transportID,
            languageCode: this._nft.languageCode,
            url: this._spiritUrl
        })).then(response => {
            let path: string = `${process.cwd()}/src/modules/game/mir4/resources/data/spirits/Spirits-${this._nft.languageCode}.json`;
            if (!fs.existsSync(path))
                fs.createWriteStream(path);

            let file = fs.readFileSync(path, 'utf-8')
            let data = null

            let modifiedSpirits: Spirit[] = []
            let oldSpirits: Spirit[] = []

            try {
                data = JSON.parse(file.toString())
                modifiedSpirits = data as Spirit[]
                oldSpirits = Object.assign(oldSpirits, modifiedSpirits)
            } catch (e) {
                data = null
            }

            let spirit: SpiritObject = response.data as SpiritObject
            list.spirits = spirit.data

            spirit.data.inven.forEach(spirit => {
                if (!modifiedSpirits.some(cacheSpirit => cacheSpirit.petName === spirit.petName))
                    modifiedSpirits.push(spirit)
            })

            if (JSON.stringify(modifiedSpirits) != JSON.stringify(oldSpirits)) {
                fs.writeFileSync(path, JSON.stringify(modifiedSpirits))
            }
        }).catch(error => {
            console.log(error)
        })
    }
}