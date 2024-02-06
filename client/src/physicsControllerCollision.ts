import { SceneObject } from "./sceneObject";
import { PhysicsControllerCollisionDirection } from "./physicsControllerCollisionDirection";

export class PhysicsControllerCollision {
    alice: SceneObject;
    bob: SceneObject;
    // @ts-ignore
    distance: float;
    direction: PhysicsControllerCollisionDirection;

    constructor(
        alice: SceneObject,
        bob: SceneObject,
        // @ts-ignore
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