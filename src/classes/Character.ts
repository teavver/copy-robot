import { Direction } from "../types/Direction"
import { CONSTANTS } from "../game/constants"
import { Model, ModelState } from "./Model"

interface CharacterInternalData extends CharacterData {
    isShooting: boolean
    shootCooldown: number
    isAirborne: boolean
    jumpFrame: number   // jump height blocker
}

export interface CharacterData {
    health: number
    faceDir: Direction // Direction of looking at spawn time
}

// Character is an extension of Model with basic non-diagonal moveset logic
// some data, and the ability to shoot projectiles
export class Character extends Model {
    public data: CharacterInternalData

    constructor(data: CharacterData, charModel: Model) {
        super(
            {
                type: charModel.type,
                state: charModel.state,
                gravityDirection: charModel.gravityDirection,
                displayCollision: charModel.displayCollision,
                collisionScope: charModel.getCollisionScope()
            },
            charModel.getShape(),
            charModel.name,
            charModel.pos,
        )

        this.data = {
            health: data.health,
            faceDir: data.faceDir,
            jumpFrame: 0,
            isAirborne: false,
            isShooting: false,
            shootCooldown: 0,
        }
    }

    shoot() {
        if (this.data.shootCooldown > 0) return
        this.data.shootCooldown += 20
        this.data.isShooting = true
    }

    move(dir: Direction) {
        if (dir === Direction.UP) {
            this.jump()
            return
        }
        this.addMoveIntent(dir)
        if (dir === Direction.LEFT || dir === Direction.RIGHT) {
            this.data.faceDir = dir
        }
    }

    changeHealth(newVal: number) {
        this.data.health = newVal
    }

    private jump() {
        if (this.data.isAirborne) return
        this.data.jumpFrame++
        this.data.isAirborne = true
        this.addMoveIntent(Direction.UP)
    }

    private land() {
        this.data.jumpFrame = 0
        this.data.isAirborne = false
    }

    // handle all internal state updates
    // NOTE: this should be called before applying move force
    updateData() {

        if (this.data.shootCooldown > 0) {
            this.data.shootCooldown--
        }

        if (this.getCollisionMap().includes(Direction.DOWN)) {
            this.land()
        }

        // handle jump
        if (this.data.jumpFrame !== 0) {
            // stop going up if at max height
            const maxHeight =
                (this.getShape().size.height * CONSTANTS.BLOCK_SIZE_PX) /
                CONSTANTS.PLAYER_MOVE_SPEED
            if (this.data.jumpFrame >= maxHeight) {
                this.data.jumpFrame = 0
                return
            }
            this.removeMoveIntent(Direction.DOWN)
            this.addMoveIntent(Direction.UP)
            this.data.jumpFrame++
        }

        // Death
        if (this.data.health < 1) {
            this.modifyState(ModelState.DESTROYED)
        }
    }
}
