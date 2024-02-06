import { SceneObjectCommand } from "./sceneObjectCommand.js";
import { Vector3 } from "./vector3.js";

export class SceneObjectCommandTranslate extends SceneObjectCommand {

    translate: Vector3

    constructor(
        name: string,
        time: number,
        translate: Vector3,
        nextCommandName?: string
    ) {
        super(name, time, nextCommandName)
        this.translate = translate
    }

}