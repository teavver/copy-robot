import { Direction } from "../types/Direction";
import { Model } from "./Model";

interface PlayerData {
    health: number
    isShooting: boolean
}

export class Player extends Model {

    data: PlayerData

    constructor(playerModel: Model) {

        super(
            {
                type: playerModel.type,
                state: playerModel.state,
                gravity: playerModel.gravity,
                displayCollision: playerModel.displayCollision
            },
            playerModel.getShape(),
            playerModel.name,
            playerModel.pos
        )

        this.data = {
            health: 100,
            isShooting: false
        }

    }

    private jump() {
        // if we're not on the ground, we cant jump 
        // console.log("col map", this.getCollisionMap())
        if (!this.getCollisionMap().includes(Direction.DOWN)) return
        console.log("JUMP")
        this.removeMoveIntent(Direction.DOWN)
        this.addMoveIntent(Direction.UP)
    }

    move(dir: Direction) {
        if (dir === Direction.UP) {
            this.jump()
        } else {
            this.addMoveIntent(dir)
        }

    }

}