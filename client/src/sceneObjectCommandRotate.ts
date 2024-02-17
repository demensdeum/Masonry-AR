import { SceneObjectCommand } from "./sceneObjectCommand.js";
import * as THREE from "three"

export class SceneObjectCommandRotate extends SceneObjectCommand {

    rotate: THREE.Vector3

    constructor(
        name: String,
        time: number,
        rotate: THREE.Vector3
    ) {
        super(
            name,
            time
        )
        this.rotate = rotate
    }

}