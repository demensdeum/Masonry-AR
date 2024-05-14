import * as THREE from "three"
import { GameVector3 } from "./gameVector3.js"

export class GameCssObject3D extends THREE.Object3D {
    isTop: boolean = true
    stickToCamera: boolean = true
    originalRotation: GameVector3 = GameVector3.zero()
    originalPosition: GameVector3 = GameVector3.zero()
}