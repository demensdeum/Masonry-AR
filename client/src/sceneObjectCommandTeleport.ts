import { SceneObjectCommand } from "./sceneObjectCommand.js";
import { Vector3 } from "./vector3";

export class SceneObjectCommandTeleport extends SceneObjectCommand {
    
    position: Vector3
    rotation: Vector3

    constructor(
        name: String,
        time: number,
        position: Vector3,
        rotation: Vector3,
        nextCommand: String
    ) {
        super(name, time, nextCommand)
        this.position = position
        this.rotation = rotation
    }

}