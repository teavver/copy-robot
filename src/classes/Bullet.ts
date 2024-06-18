import { Direction } from "../types/Direction";
import { Position } from "../types/Position";
import { Model, ModelState, ModelType } from "./Model";
import ENV from "../environment";

export interface BulletData {
    owner: string       // Bullet collision is off for owner
    startingPos: Position
    gravityDirection: Direction
}

export class Bullet extends Model {

    data: BulletData

    constructor(data: BulletData) {
        super(
            {
                type: ModelType.PROJECTILE,
                state: ModelState.NORMAL,
                gravityDirection: data.gravityDirection,
                displayCollision: true
            },
            {
                size: {
                    width: 1,
                    height: 1
                },
                texture: "White"
            },
            `${data.owner}'s Bullet`,
            data.startingPos
        )

        this.data = data
    }
}