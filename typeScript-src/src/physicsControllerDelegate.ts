import { PhysicsControllerCollision } from "./physicsControllerCollision"
import { PhysicsController } from "./physicsController"
import { SimplePhysicsControllerBody } from "./simplePhysicsControllerBody";
import { Vector3 } from "./vector3";
import { PhysicsControllerCollisionDirection } from "./physicsControllerCollisionDirection";
import { SceneObject } from "./sceneObject";

export interface PhysicsControllerDelegate {
    physicsControllerDidDetectDistance(
        physicsController: PhysicsController,
        collision: PhysicsControllerCollision
    ): void;
    physicsControllerDidDetectFreeSpace(
        physicsController: PhysicsController,
        sceneObject: SceneObject,
        direction: PhysicsControllerCollisionDirection
    ): void;    
    physicControllerRequireApplyPosition(
        objectName: string,
        physicsController: PhysicsController,
        position: Vector3
    ): void;
}