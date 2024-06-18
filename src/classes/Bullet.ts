import { Direction } from "../types/Direction";
import { Position } from "../types/Position";
import { CollisionScope, Model, ModelState, ModelType } from "./Model";
import ENV from "../environment";

export interface BulletData {
    owner: string              // Bullet collision is off for owner
    startingPos: Position
    gravityDirection: Direction
    targetModelType: ModelType // Bullets can only target one Model type
}

export class Bullet extends Model {

    data: BulletData

    constructor(data: BulletData) {
        super(
            {
                type: ModelType.PROJECTILE,
                state: ModelState.NORMAL,
                gravityDirection: data.gravityDirection,
                displayCollision: ENV.DRAW_COLLISION,
                collisionScope: {
                    scope: CollisionScope.SINGLE_MODEL_TYPE,
                    targetModelType: data.targetModelType
                }
            },
            {
                size: {
                    width: 1,
                    height: 1
                },
                texture: "White"
            },
            `Bullet (${data.owner})`,
            data.startingPos
        )

        this.data = data
    }
}