import { BLOCK_SIZE_PX, PLAYER_MOVE_SPEED } from "../game/globals"
import { Direction } from "../types/Direction"
import { Model, ModelState } from "./Model"

interface PlayerData {
    health: number
    isShooting: boolean
    shootCooldown: number
    isJumping: boolean
    jumpFrame: number   // jump height blocker
    faceDir: Direction
}

export class Player extends Model {
    data: PlayerData

    constructor(playerModel: Model) {
        super(
            {
                type: playerModel.type,
                state: playerModel.state,
                gravity: playerModel.gravity,
                gravityDirection: Direction.DOWN,
                displayCollision: playerModel.displayCollision,
            },
            playerModel.getShape(),
            playerModel.name,
            playerModel.pos,
        )

        this.data = {
            health: 100,
            jumpFrame: 0,
            isJumping: false,
            isShooting: false,
            shootCooldown: 0,
            faceDir: Direction.RIGHT
        }
    }

    shoot() {
        if (this.data.shootCooldown > 0) return
        this.data.shootCooldown += 30 // TODO: Find good value
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

    private jump() {
        if (this.data.isJumping) return
        this.data.jumpFrame++
        this.data.isJumping = true
        this.addMoveIntent(Direction.UP)
    }

    private land() {
        this.data.jumpFrame = 0
        this.data.isJumping = false
    }

    // handle all internal state updates
    // this should be called before applying move force
    updateData() {

        if (this.data.shootCooldown > 0) {
            this.data.shootCooldown--
        }

        if (this.getCollisionMap().includes(Direction.DOWN)) {
            this.land()
        }

        // handle jump
        if (this.data.jumpFrame !== 0) {
            // max jump height
            const maxHeight =
                (this.getShape().size.height * BLOCK_SIZE_PX) /
                PLAYER_MOVE_SPEED
            if (this.data.jumpFrame >= maxHeight) {
                this.data.jumpFrame = 0
                return
            }
            this.removeMoveIntent(Direction.DOWN) // suck it, gravity
            this.addMoveIntent(Direction.UP)
            this.data.jumpFrame++
        }

        // die
        if (this.data.health < 1) {
            this.modifyState(ModelState.DESTROYED)
        }
    }
}
