import { float } from "./types.js";
import { SceneObject } from "./sceneObject.js";
import { PhysicsControllerCollisionDirection } from "./physicsControllerCollisionDirection.js";

export class PhysicsControllerCollision {
    alice: SceneObject;
    bob: SceneObject;
    distance: float;
    direction: PhysicsControllerCollisionDirection;

    constructor(
        alice: SceneObject,
        bob: SceneObject,
        distance: float,
        direction: PhysicsControllerCollisionDirection
    )
    {
        this.alice = alice;
        this.bob = bob;
        this.distance = distance;
        this.direction = direction;
    }
};