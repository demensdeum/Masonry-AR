import { GameVector3 } from "./gameVector3.js";
import { float } from "./types.js";
import { debugPrint } from "./runtime.js";

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
        const directionVector = this.toPosition.subtract(this.currentPosition)
        const normalizedDirection = directionVector.normalize()
        const step = normalizedDirection.multiply(this.speed)
        const distanceToTarget = this.currentPosition.distanceTo(this.toPosition)
        if (distanceToTarget <= step.length()) {
            return this.toPosition
        }        
        const newPosition = this.currentPosition.add(step)
        debugPrint(`newPosition: ${newPosition.printable()}`)
        return newPosition;
    }
}