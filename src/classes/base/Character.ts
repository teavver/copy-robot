import { playerSpriteData } from "../../game/data/sprites"
import { Direction } from "../../types/Direction"
import { CONSTANTS } from "../../game/constants"
import { Model, ModelCallbacks, ModelParams, ModelState } from "./Model"

interface CharacterInternalData extends CharacterData {
    isShooting: boolean
    shootCooldown: number
    isAirborne: boolean
    jumpFrame: number   // jump height blocker
}

export interface CharacterData extends ModelCallbacks {
    health: number
    faceDir: Direction // Direction of looking at spawn time   
}

// Character is an extension of Model with basic non-diagonal moveset logic
// some data, and the ability to shoot projectiles
export class Character extends Model {
    data: CharacterInternalData

    constructor(data: CharacterData, mParams: ModelParams) {
        super(mParams)

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
        this.data.shootCooldown += CONSTANTS.SHOOT_COOLDOWN
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
            if (!this.data.isAirborne) {
                this.setSpriteData(
                    playerSpriteData["running"],
                    dir === Direction.LEFT ? true : false
                )
            }
            return
        }
    }

    applyDamage(val: number = CONSTANTS.HIT_DAMAGE) {
        this.data.health -= val
    }

    private jump() {
        if (this.data.isAirborne) return
        this.data.jumpFrame++
        this.data.isAirborne = true
        this.addMoveIntent(Direction.UP)
        this.setSpriteData(
            playerSpriteData["jumping"],
            this.data.faceDir === Direction.LEFT ? true : false
        )
    }

    private land() {
        if (!this.data.isAirborne) return
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

        // Stand (no movement = reset Sprite to idle)
        if (this.getMoveIntentMap().length === 0) {
            this.setSpriteData(
                playerSpriteData["idle"],
                this.data.faceDir === Direction.LEFT ? true : false
            )
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
