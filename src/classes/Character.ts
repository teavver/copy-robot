import { BLOCK_SIZE_PX, PLAYER_MOVE_SPEED } from "../game/globals"
import { Direction } from "../types/Direction"
import { Model, ModelState } from "./Model"

interface CharacterData {
    health: number
    faceDir: Direction
    isShooting: boolean
    shootCooldown: number
    isAirborne: boolean
    jumpFrame: number   // jump height blocker
}

export class Character extends Model {
    public data: CharacterData

    constructor(charModel: Model) {
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
            health: 100,
            jumpFrame: 0,
            isAirborne: false,
            isShooting: false,
            shootCooldown: 0,
            faceDir: Direction.RIGHT
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
                (this.getShape().size.height * BLOCK_SIZE_PX) /
                PLAYER_MOVE_SPEED
            if (this.data.jumpFrame >= maxHeight) {
                this.data.jumpFrame = 0
                return
            }
            this.removeMoveIntent(Direction.DOWN)
            this.addMoveIntent(Direction.UP)
            this.data.jumpFrame++
        }

        // Death
        console.log(this.data.health)
        if (this.data.health < 1) {
            this.modifyState(ModelState.DESTROYED)
        }
    }
}
