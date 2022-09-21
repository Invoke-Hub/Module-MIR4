/**
 * A interface representing mir4 nft properties
 *
 * @author  Devitrax
 * @version 1.0, 11/09/22
 */
export interface Skill {
    skillLevel: number;
    skillName: string;
}

export interface SkillObject {
    code: number;
    data: Skill[];
}