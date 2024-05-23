import { Position } from "../types/Position"
import { Direction } from "../types/Direction"

export class Player {
    private position: Position

    constructor(initialPosition: Position) {
        this.position = { ...initialPosition }
    }

    move(direction: Direction): void {
        switch (direction) {
            case Direction.UP:
                this.position.y -= 4
                break
            case Direction.DOWN:
                this.position.y += 4
                break
            case Direction.LEFT:
                this.position.x -= 4
                break
            case Direction.RIGHT:
                this.position.x += 4
                break
        }
    }

    getPosition(): Position {
        return this.position
    }
}
