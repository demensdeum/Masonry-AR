import { float } from "./types.js"
import { SceneObject } from "./sceneObject.js";
import { PhysicsControllerCollision } from "./physicsControllerCollision.js";
import { PhysicsControllerDelegate } from "./physicsControllerDelegate.js";

export interface PhysicsController {
    delegate?: PhysicsControllerDelegate;
    addSceneObject(sceneObject: SceneObject): void;
    requireJump(sceneObject: SceneObject): void;
    step(delta: float): void;
}