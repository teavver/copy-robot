import { assetManager } from "../../components/GameCanvas";
import { BASE_GAME_SHAPES } from "../../game/data/shapes";
import { CollisionScope } from "../../types/Collision";
import { Direction } from "../../types/Direction";
import { Position } from "../../types/Position";
import { Model, ModelCallbacks, ModelParams, ModelState, ModelType } from "./Model";

export interface ProjectileData extends ModelCallbacks {
    owner: string              // Projectile collision is off for owner
    startingPos: Position
    gravityDirection: Direction
    targetModelType: ModelType // Projectiles can only target one Model type (for now)
}

export class Projectile extends Model {

    data: ProjectileData

    constructor(data: ProjectileData) {

        const initializedMParams: ModelParams = {
            data: {
                type: ModelType.PROJECTILE,
                state: ModelState.NORMAL,
                gravityDirection: data.gravityDirection,
                collisionScope: {
                    scope: CollisionScope.SINGLE_MODEL_TYPE,
                    targetModelType: data.targetModelType
                }
            },
            name: `Projectile (${data.owner})`,
            initialPos: data.startingPos,
            shape: {
                size: BASE_GAME_SHAPES.projectileShape.size,
                txt: assetManager.getTexture(BASE_GAME_SHAPES.projectileShape.txtName)
            }
        }

        super(initializedMParams)
        this.data = data
    }
}