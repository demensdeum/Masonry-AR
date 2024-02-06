import { SceneObjectCommand } from "./sceneObjectCommand.js";
import { int } from "./types.js";
import { Vector3 } from "./vector3.js";
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"
import { SceneObjectCommandTranslate } from "./sceneObjectCommandTranslate.js"
import { SceneObjectCommandJump } from "./sceneObjectCommandJump.js"
import { SceneObjectCommandRotate } from "./sceneObjectCommandRotate.js";

export class SceneObjectCommandsFactory {

    static idle(
        name: string,
        time: int
    ): SceneObjectCommand {
        return new SceneObjectCommandIdle(
            name,
            time
        )
    }

    static moveForward(
        name: string,
        time: int
    ): SceneObjectCommand {
        return new SceneObjectCommandTranslate(
            name,
            time,
            new Vector3(0, 0, -0.05)
        )
    }

    static moveBackward(
        name: string,
        time: int
    ): SceneObjectCommand {
        return new SceneObjectCommandTranslate(
            name,
            time,
            new Vector3(0, 0, 0.05)
        )
    }    

    static moveLeft(
        name: string,
        time: int
    ): SceneObjectCommand {
        return new SceneObjectCommandTranslate(
            name,
            time,
            new Vector3(-0.1, 0.0, 0)
        )
    }

    static moveRight(
        name: string,
        time: int
    ): SceneObjectCommand {
        return new SceneObjectCommandTranslate(
            name,
            time,
            new Vector3(0.1, 0.0, 0)
        )
    }

    static jump(
        name: string,
        time: int
    ): SceneObjectCommand {
        return new SceneObjectCommandJump(
            name,
            time
        )
    }

    static rotateLeft(
        name: string,
        time: int
    ): SceneObjectCommand {
        return new SceneObjectCommandRotate(
            name,
            time,
            new Vector3(0.0, 0.01, 0.0)
        )
    }

    static rotateRight(
        name: string,
        time: int
    ): SceneObjectCommand {
        return new SceneObjectCommandRotate(
            name,
            time,
            new Vector3(0.0, -0.01, 0.0)
        )
    }
}