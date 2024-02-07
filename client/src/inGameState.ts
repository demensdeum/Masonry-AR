import { State } from "./state.js"
import { debugPrint } from "./runtime.js"
import { GeolocationController } from "./geolocationController.js"
import { GeolocationControllerDelegate } from "./geolocationControllerDelegate.js"
import { GeolocationPosition } from "./geolocationPosition.js"
import { EntitiesController } from "./entitiesController.js"
import { EntitiesControllerDelegate } from "./entitiesControllerDelegate.js"
import { Entity } from "./entity.js"
import { DecorControls } from "./decorControls.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"
import { Names } from "./names.js"
import { Utils } from "./utils.js"
import { SceneControllerDelegate } from "./sceneControllerDelegate.js"
import { SceneController } from "./sceneController.js"

export class InGameState extends State implements GeolocationControllerDelegate,
                                                    EntitiesControllerDelegate,
                                                    SceneControllerDelegate {
    name = "InGameState"
    
    private position: GeolocationPosition | null = null
    private geolocationController = new GeolocationController(this)
    private entitiesController = new EntitiesController(this)    
    private entitiesCalled = false
    private sceneObjectNameToEntity: { [key: string]: Entity } = {};

    initialize(): void {
        const canvas = this.context.canvas
        if (canvas != null) {
            this.context.sceneController.delegate = this
            this.geolocationController.trackPosition()
            this.context.sceneController.switchSkyboxIfNeeded(
                "com.demensdeum.blue.field"
            )
            this.context.sceneController.addModelAt(
                "hero",
                "com.demensdeum.hero",
                0,
                0,
                0,
                0,
                0,
                0,
                true,
                new DecorControls(
                    "hero",
                    new SceneObjectCommandIdle(
                        "idle",
                        0
                    ),
                    this.context.sceneController,
                    this.context.sceneController,
                    this.context.sceneController
                )
            )
            this.context.sceneController.addModelAt(
                "floor",
                "com.demensdeum.floor",
                0,
                0,
                0,
                0,
                0,
                0,
                false,
                new DecorControls(
                    "floor",
                    new SceneObjectCommandIdle(
                        "idle",
                        0
                    ),
                    this.context.sceneController,
                    this.context.sceneController,
                    this.context.sceneController
                )                
            )
            this.context.sceneController.rotateObjectTo(
                Names.Camera,
                Utils.angleToRadians(-55),
                0,
                0
            )
        }
    }

    step(): void {
        if (this.position != null && this.entitiesCalled != true) {
            this.entitiesController.getEntities(this.position)
            this.entitiesCalled = true
        }

        const cameraPosition = this.context.sceneController.sceneObjectPosition("hero").clone()
        cameraPosition.y += 1.7
        cameraPosition.z += 1.2

        this.context.sceneController.moveObjectTo(
            Names.Camera,
            cameraPosition.x,
            cameraPosition.y,
            cameraPosition.z
        )
    }

    geolocationControllerDidGetPosition(
        controller: GeolocationController,
        position: GeolocationPosition
    ) {
        this.position = position
        debugPrint(`Position: ${position.latitude}, ${position.longitude}`)
    }

    entitiesControllerDidFetchEntities(
        controller: EntitiesController,
        entities: Entity[]
    ) {
        const self = this
        var i = 0.5
        entities.forEach((entity)=>{
            const name = `${entity.type}-${entity.id}`
            const modelName = "com.demensdeum.hero"
            const controls = new DecorControls(
                name,
                new SceneObjectCommandIdle(
                    "idle",
                    0
                ),
                self.context.sceneController,
                self.context.sceneController,
                self.context.sceneController
            )
            self.context.sceneController.addBoxAt(
                `collider-box-${name}`,
                i - 0.2,
                0.8,
                -i + 0.65,
                "com.demensdeum.loading",
                0.3,
                0xFF00FF,
                0.1
            )
            self.context.sceneController.addModelAt(
                name,
                modelName,
                i,
                0,
                -i,
                0,
                0,
                0,
                false,
                controls
            )
            i += 0.5

            self.sceneObjectNameToEntity[name] = entity
        })
    }

    sceneControllerDidPickSceneObjectWithName(
        controller: SceneController, 
        name: string
    ): void {        
        if (name.startsWith("collider-box-")) {
            name = name.substring("collider-box-".length)
            debugger
        }
        if (name in this.sceneObjectNameToEntity == false) {
            return
        }
        const entity = this.sceneObjectNameToEntity[name]
        debugPrint(`UUID: ${entity.uuid}`)        
    }
}