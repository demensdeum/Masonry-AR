import * as THREE from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { Paths } from "./paths.js";
import { WeatherController } from "./weatherController.js";
import { int } from "./types.js";
import { WeatherControllerDelegate } from "./weatherControllerDelegate.js";
import { Utils } from "./utils.js";
import { debugPrint } from "./runtime.js";

export class SnowflakesController implements WeatherController {

    private readonly modelLoader = new GLTFLoader();
    private readonly snowflakeModelPath = "com.demensdeum.snowflake";

    private instancedSnowflakeMesh?: any;
    private readonly snowflakesCount: int = 1040;

    private delegate: WeatherControllerDelegate;

    private position = new THREE.Vector3();
    private matrix = new THREE.Matrix4();

    private readonly material = new THREE.MeshBasicMaterial({
        color: "white"
    });    


    constructor(
        delegate: WeatherControllerDelegate
    )
    {
        this.delegate = delegate;
    }

    initialize()
    {
        const self = this;
        this.modelLoader.load(
            Paths.modelPath(this.snowflakeModelPath),
            (container) => {
                const model = container.scene;            
                model.traverse((entity) => {
                    if ((<THREE.Mesh> entity).isMesh) {
                        const mesh = (<THREE.Mesh> entity);
                        self.instancedSnowflakeMesh = new THREE.InstancedMesh(
                            mesh.geometry,
                            this.material, 
                            self.snowflakesCount
                        );

                        const startX = -30;
                        const startZ = -40;

                        for (let i = 0; i < this.snowflakesCount; i++) {
                            this.position.x = startX + i / 20.0;
                            this.position.y = 1 + Utils.randomFloat(7);
                            this.position.z = startZ + Utils.randomInt(55);
                            
                            const euler = new THREE.Euler(Utils.angleToRadians(90), 0, 0, 'YXZ' );
                            const quaternion = new THREE.Quaternion();
                            quaternion.setFromEuler(euler);

                            const scale = 0.05;
                            const scaleVector = new THREE.Vector3();
                            scaleVector.x = scale;
                            scaleVector.y = scale;
                            scaleVector.z = scale;

                            this.matrix.compose(this.position, quaternion, scaleVector);
                            self.instancedSnowflakeMesh.setMatrixAt(i, this.matrix);
                        }

                        self.delegate.weatherControllerDidRequireToAddInstancedMeshToScene(
                            self, 
                            self.instancedSnowflakeMesh
                        );

                        return;
                    }
                })
            });        
    }

    step(delta: any) {
        this.changeSnowflakesPositionStep();
    }

    private changeSnowflakesPositionStep()  {
        if (!this.instancedSnowflakeMesh) {
            return;
        }

        const startX = -30;

        for (let i = 0; i < this.snowflakesCount; i++) {
            this.instancedSnowflakeMesh.getMatrixAt(i, this.matrix);
            this.position.setFromMatrixPosition(this.matrix);
            this.position.y -= 0.01;
            if (this.position.y < -1.5) {
                this.position.y = 4 + Utils.randomFloat(4);
            }
            this.matrix.setPosition(this.position);
            this.instancedSnowflakeMesh.setMatrixAt(i, this.matrix);
            this.instancedSnowflakeMesh.instanceMatrix.needsUpdate = true;
        }
    }
}