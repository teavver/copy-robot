import { Character } from "./base/Character";
import { ModelCallbacks, ModelState, ModelType } from "./base/Model";
import { boss as bossModel } from "../game/models";
import { Direction } from "../types/Direction";

export interface BossData extends ModelCallbacks { }

export class Boss extends Character {

    constructor() {
        super(
            {
                health: 500,
                faceDir: Direction.LEFT,

                onDestroy(self) {
                },

                onDirectCollision(self, targetModel) {
                    // Damage any Character that hugs the Boss
                    if (targetModel instanceof Character) { }
                },
            },
            bossModel
        )
    }
}


