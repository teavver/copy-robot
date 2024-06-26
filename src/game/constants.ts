
// Game constants
// _BL suffix means that the value is represented in BLOCKS, not pixels. one BLOCK is BLOCK_SIZE_PX pixels
class Constants {

    // Units
    static readonly SECOND_IN_MS = 1000
    static readonly BLOCK_SIZE_PX = 16

    // Game engine constants
    static readonly TARGET_FPS = 60
    static readonly PLAYER_MOVE_SPEED = 3
    static readonly PROJECTILE_MOVE_SPEED = Constants.PLAYER_MOVE_SPEED * 2
    static readonly COLLISION_DETECTION_FIELD_BL = 1
    static readonly PROJECTILE_SIZE_BL = 0.5
    static readonly PLAYER_HEALTH = 500
    static readonly SHOOT_COOLDOWN = 20 // Frames
    static readonly BOSS_HEALTH = 500
    static readonly HIT_DAMAGE = 10

    // Game data
    static readonly MAP_WIDTH_BL = 48
    static readonly MAP_HEIGHT_BL = 24
    static readonly PLAYER_WIDTH_BL = 2
    static readonly PLAYER_HEIGHT_BL = 3
    static readonly WALL_THICKNESS_BL = 2

    // Canvas
    static readonly LAYERS = {
        BACKGROUND: "BG",
        FOREGROUND: "FG",
    }

    static readonly CANVAS = {
        WIDTH: Constants.BLOCK_SIZE_PX * Constants.MAP_WIDTH_BL,
        HEIGHT: Constants.BLOCK_SIZE_PX * Constants.MAP_HEIGHT_BL,
    }
}

export const CONSTANTS = Constants
