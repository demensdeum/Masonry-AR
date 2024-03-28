import * as THREE from "three"
import { SceneObject } from "./sceneObject.js"

export class AnimationContainer {
    public readonly sceneObject: SceneObject
    public readonly animationName: string
    public animationMixer?: THREE.AnimationMixer

    constructor(
        sceneObject: SceneObject,
        animationName: string
    )
    {
        this.sceneObject = sceneObject
        this.animationName = animationName
    }
}