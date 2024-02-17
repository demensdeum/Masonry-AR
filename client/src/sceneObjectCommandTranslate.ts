import { SceneObjectCommand } from "./sceneObjectCommand.js";
import * as THREE from "three"

export class SceneObjectCommandTranslate extends SceneObjectCommand {

    translate: THREE.Vector3

    constructor(
        name: string,
        time: number,
        translate: THREE.Vector3,
        nextCommandName?: string
    ) {
        super(name, time, nextCommandName)
        this.translate = translate
    }

}