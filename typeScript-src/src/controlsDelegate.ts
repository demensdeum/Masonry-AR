import { Controls } from "./controls.js";
import { float } from "./types.js"

export interface ControlsDelegate {
    controlsRequireObjectTranslate(
        controls: Controls,
        objectName: string,
        x: float,
        y: float,
        z: float
    ): void;

    controlsRequireObjectTeleport(
        controls: Controls,
        objectName: string,
        x: float,
        y: float,
        z: float
    ): void;    

    controlsRequireObjectRotation(
        controls: Controls,
        objectName: string,
        euler: any
    ): void;

    controlsRequireJump(
        controls: Controls,
        objectName: string
    ): void;
}