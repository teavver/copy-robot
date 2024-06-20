import { ModelType } from "../classes/base/Model";

export enum CollisionScope {
    NONE, // Model with disabled collision
    SAME_LAYER,
    GLOBAL,
    SINGLE_MODEL_TYPE
}

export type ModelCollisionScope =
    | { scope: CollisionScope.NONE | CollisionScope.SAME_LAYER | CollisionScope.GLOBAL }
    | { scope: CollisionScope.SINGLE_MODEL_TYPE; targetModelType: ModelType };

export enum CollisionRectType {
    DETECT,
    ACTUAL,
}