import { Direction } from "../types/Direction";
import { Position } from "../types/Position";
import { Model, ModelState, ModelType } from "./Model";
import { CollisionScope } from "../types/Collision";
import ENV from "../environment";
import { Character } from "./Character";

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
                },

                onDirectCollision(self, targetModel) {
                    self.modifyState(ModelState.DESTROYED)
                    if (targetModel instanceof Character) {
                        const newHealth = targetModel.data.health - 20
                        console.log('bullet hit: ', targetModel.name, 'new health: ', newHealth)
                        targetModel.changeHealth(newHealth)
                    }
                },
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