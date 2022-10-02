import { List } from "../interfaces/INft";
import { Skill, SkillObject } from "../interfaces/ISkill";
import * as fs from 'fs';
import MNft from "./MNft.js";

/**
 * A class representing the mir4 model
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
export default class MSkill {

    private readonly _skillUrl: string = "https://webapi.mir4global.com/nft/character/skills"

    private readonly _nft: MNft

    constructor(nft: MNft) {
        this._nft = nft
    }

    /**
     * Retrieves data from MIR4
     *
     * @param {List} list data gathered from mir4 api
     */
    async load(list: List): Promise<void> {
        await this._nft.requestData(this._nft.requestList({
            transportID: list.transportID,
            languageCode: this._nft.languageCode,
            class: list.class,
            url: this._skillUrl
        })).then(response => {
            let path: string = `${process.cwd()}/src/modules/game/mir4/resources/data/skills/${this._nft.className(list.class)}-${this._nft.languageCode}.json`;
            if (!fs.existsSync(path))
                fs.createWriteStream(path);

            let file = fs.readFileSync(path, 'utf-8')
            let data = null

            let modifiedSkills: Skill[] = []
            let oldSkills: Skill[] = []

            try {
                data = JSON.parse(file.toString())
                modifiedSkills = data as Skill[]
                oldSkills = Object.assign(oldSkills, modifiedSkills)
            } catch (e) {
                data = null
            }

            let skill: SkillObject = response.data as SkillObject
            list.skills = skill.data

            skill.data.forEach(skill => {
                if (!modifiedSkills.some(cacheSkill => cacheSkill.skillName === skill.skillName))
                    modifiedSkills.push(skill)
            })

            if (JSON.stringify(modifiedSkills) != JSON.stringify(oldSkills)) {
                fs.writeFileSync(path, JSON.stringify(modifiedSkills))
            }
        }).catch(error => {
            console.log(error)
        })
    }
}