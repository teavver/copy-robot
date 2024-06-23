import { Direction } from "../../types/Direction";
import { Position } from "../../types/Position";
import { Model, ModelCallbacks, ModelParams, ModelType } from "./Model";

export interface ProjectileData extends ModelCallbacks {
    owner: string              // Projectile collision is off for owner
    startingPos: Position
    gravityDirection: Direction
    targetModelType: ModelType // Projectiles can only target one Model type (for now)
}

export class Projectile extends Model {

    data: ProjectileData

    constructor(data: ProjectileData, mParams: ModelParams) {
        super(mParams)
        this.data = data
    }
}