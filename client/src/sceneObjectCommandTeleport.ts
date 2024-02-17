import { SceneObjectCommand } from "./sceneObjectCommand.js";
import * as THREE from "three"

export class SceneObjectCommandTeleport extends SceneObjectCommand {
    
    position: THREE.Vector3
    rotation: THREE.Vector3

    constructor(
        name: String,
        time: number,
        position: THREE.Vector3,
        rotation: THREE.Vector3,
        nextCommand: String
    ) {
        super(name, time, nextCommand)
        this.position = position
        this.rotation = rotation
    }

}