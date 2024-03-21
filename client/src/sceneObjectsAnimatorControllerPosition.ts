import { GameVector3 } from "./gameVector3.js";
import { float } from "./types.js";

export class SceneObjectsAnimatorControllerPosition {
    currentPosition: GameVector3
    toPosition: GameVector3
    speed: float

    constructor(
        currentPosition: GameVector3,
        toPosition: GameVector3,
        speed: float
    ) {
        this.currentPosition = currentPosition
        this.toPosition = toPosition
        this.speed = speed
    } 

    public moveVector(): GameVector3 {
        return this.currentPosition.moveVector(
            this.toPosition,
            this.speed
        )
    }
}