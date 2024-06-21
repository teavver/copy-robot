import { Direction } from "../../types/Direction";
import { Position } from "../../types/Position";
import { Model, ModelCallbacks, ModelState, ModelType } from "./Model";
import { CollisionScope } from "../../types/Collision";
import ENV from "../../environment";
import { CONSTANTS } from "../../game/constants";

export interface ProjectileData extends ModelCallbacks {
    owner: string              // Projectile collision is off for owner
    startingPos: Position
    gravityDirection: Direction
    targetModelType: ModelType // Projectiles can only target one Model type (for now)
}

export class Projectile extends Model {

    data: ProjectileData

    constructor(data: ProjectileData) {
        super(
            {
                type: ModelType.PROJECTILE,
                state: ModelState.NORMAL,
                gravityDirection: data.gravityDirection,
                displayCollision: ENV.DRAW_COLLISION,
                collisionScope: {
                    scope: CollisionScope.SINGLE_MODEL_TYPE,
                    targetModelType: data.targetModelType
                },

                onDirectCollision: data.onDirectCollision,
                onDestroy: data.onDestroy,
            },
            {
                size: {
                    width: CONSTANTS.PROJECTILE_SIZE_BL,
                    height: CONSTANTS.PROJECTILE_SIZE_BL,
                },
                txtData: { type: "Color", color: "White" }
            },
            `Projectile (${data.owner})`,
            data.startingPos
        )

        this.data = data
    }
}