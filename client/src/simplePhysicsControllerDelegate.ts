import { SimplePhysicsController } from "./simplePhysicsController";

export interface SimplePhysicsControllerDelegate {
    simplePhysicControllerRequireToAddArrowHelperToScene(
        simplePhysicsController: SimplePhysicsController, 
        arrowHelper: any
    ): void;
    simplePhysicsControllerRequireToDeleteArrowHelperFromScene(
        simplePhysicsController: SimplePhysicsController,
        arrowHelper: any
    ): void;
}