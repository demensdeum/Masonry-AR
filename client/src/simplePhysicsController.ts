import * as THREE from "three"
import { int } from "./types.js"
import { PhysicsController } from "./physicsController.js";
import { SceneObject } from "./sceneObject.js";
import { PhysicsControllerCollision } from "./physicsControllerCollision.js";
import { SimplePhysicsControllerDelegate } from "./simplePhysicsControllerDelegate.js";
import { PhysicsControllerDelegate } from "./physicsControllerDelegate.js";
import { PhysicsControllerCollisionDirection } from "./physicsControllerCollisionDirection.js";
import { float } from "./types.js";
import { debugPrint } from "./runtime.js";
import { SimplePhysicsControllerBody } from "./simplePhysicsControllerBody.js";

export class SimplePhysicsController implements PhysicsController {
    private raycaster: any;
    private sceneObjects: SceneObject[] = [];

    private sceneObjectToPhysicsBody: { [key: string]: SimplePhysicsControllerBody } = {};
    private rayDebugEnabled: boolean = false;
    public enabled = true;

    public delegate?: PhysicsControllerDelegate;
    public simplePhysicsControllerDelegate?: SimplePhysicsControllerDelegate;

    constructor(
        rayDebugEnabled: boolean = false
    ) {
        this.rayDebugEnabled = rayDebugEnabled;
        this.raycaster = new THREE.Raycaster();
    }

    addSceneObject(sceneObject: SceneObject) {
        this.sceneObjects.push(sceneObject);
        const physicsBody = new SimplePhysicsControllerBody();
        this.sceneObjectToPhysicsBody[sceneObject.name] = physicsBody;
    }

    public step(
        delta: float
    ) {
        const self  = this;
        
        this.sceneObjects.forEach((alice) => {
            if (!alice.isMovable) {
                return;
            }

            const downVector = new THREE.Vector3(0, -1, 0);

            alice.threeObject.translateZ(-1);
            const frontVectorTarget = alice.threeObject.position.clone();
            alice.threeObject.translateZ(1);

            const frontVector = new THREE.Vector3().subVectors(
                frontVectorTarget, 
                alice.threeObject.position)
            .normalize();

            alice.threeObject.translateX(-1);
            const leftVectorTarget = alice.threeObject.position.clone();
            alice.threeObject.translateX(1);

            const leftVector = new THREE.Vector3().subVectors(
                leftVectorTarget, 
                alice.threeObject.position)
            .normalize();   
            
            const rightVector = new THREE.Vector3().subVectors(
                alice.threeObject.position, 
                leftVectorTarget)
            .normalize();               

            const backVector = new THREE.Vector3().subVectors(
                alice.threeObject.position,
                frontVectorTarget
                )
            .normalize();            

            self.emitRay(
                alice,
                delta,
                downVector,
                PhysicsControllerCollisionDirection.Down,
                0xFF0000
            );

            self.emitRay(
                alice,
                delta,
                leftVector,
                PhysicsControllerCollisionDirection.Left,
                0x00FF00
            );

            self.emitRay(
                alice,
                delta,
                rightVector,
                PhysicsControllerCollisionDirection.Right,
                0xFFFF00
            );            

            self.emitRay(
                alice,
                delta,
                frontVector,
                PhysicsControllerCollisionDirection.Front,
                0x0000FF
            );

            self.emitRay(
                alice,
                delta,
                backVector,
                PhysicsControllerCollisionDirection.Back,
                0x00FFFF
            );            
        });
    }

    requireJump(sceneObject: SceneObject): void {
        const physicBody = this.sceneObjectToPhysicsBody[sceneObject.name];
        if (physicBody.verticalForce == 0) {
            physicBody.verticalForce += 0.04;
        }
    }

    private emitRay(
        alice: SceneObject,
        delta: float,
        directionVector: any,
        direction: PhysicsControllerCollisionDirection,
        hex: int
    ) {      
        if (this.enabled == false) {
            const collision = new PhysicsControllerCollision(
                alice,
                alice,
                0,
                direction
            )
            this.delegate?.physicsControllerDidDetectDistance(
                this,
                collision
            )
            this.delegate?.physicsControllerDidDetectFreeSpace(
                this,
                alice,
                direction
            )            
            return
        }        
        var arrowHelper: any = null;  
        
        const origin = new THREE.Vector3(
            alice.threeObject.position.x,
            alice.threeObject.position.y,
            alice.threeObject.position.z
        );

        if (this.rayDebugEnabled) {
            const length = 10;        
            arrowHelper = new THREE.ArrowHelper(
                directionVector, 
                origin, 
                length, 
                hex
            );
            this.simplePhysicsControllerDelegate?.simplePhysicControllerRequireToAddArrowHelperToScene(
                this,
                arrowHelper
            );         
        }
        this.raycaster.set(
            origin,
            directionVector
        );

        var didDetectCollision = false;

        this.sceneObjects.forEach((bob) => {
            if (alice.name == bob.name) {
                return;
            }
            if (bob.isMovable == true) {
                return;
            }
            const collisions = this.raycaster.intersectObjects(
                bob.meshes,
                false
            );                
            if (collisions.length > 0) {  
                didDetectCollision = true;
                const distance = collisions[0].distance;          
                if (this.delegate) {
                    const collision = new PhysicsControllerCollision(
                        alice,
                        bob,
                        distance,
                        direction
                    );
                    this.delegate.physicsControllerDidDetectDistance(
                        this,
                        collision
                    );
                    if (direction == PhysicsControllerCollisionDirection.Down) {
                        const physicsBody = this.sceneObjectToPhysicsBody[alice.name];
                        const heightCap = 0.4;
                        const position = alice.threeObject.position.clone();
                        if (collision.distance > heightCap || physicsBody.verticalForce > 0) {
                            physicsBody.verticalForce -= 0.001;
                            debugPrint(physicsBody.verticalForce);
                            position.y += physicsBody.verticalForce;
                        }
                        else {
                            const diff = heightCap - distance;
                            physicsBody.verticalForce = 0;
                            position.y += diff;
                        }
                        this.delegate.physicControllerRequireApplyPosition(
                            alice.name,
                            this,
                            position
                        )                     
                    }
                }
            }
        }) 
        
        if (didDetectCollision == false) {
            this.delegate?.physicsControllerDidDetectFreeSpace(
                this,
                alice,
                direction
            )            
        }
    }
}