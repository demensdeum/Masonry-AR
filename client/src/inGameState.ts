import { Context } from "./context.js";
import { State } from "./state.js";
import { debugPrint } from "./runtime.js";
import { GeolocationController } from "./geolocationController.js";
import { GeolocationControllerDelegate } from "./geolocationControllerDelegate.js";
import { GeolocationPosition } from "./geolocationPosition.js";
import { PlayerControls } from "./playerControls.js"
import { EntitiesController } from "./entitiesController.js";
import { EntitiesControllerDelegate } from "./entitiesControllerDelegate.js";
import { Entity } from "./entity.js";
import { DecorControls } from "./decorControls.js";
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js";

export class InGameState extends State implements GeolocationControllerDelegate,
                                                    EntitiesControllerDelegate {
    name = "InGameState"
    
    private position: GeolocationPosition | null = null
    private geolocationController = new GeolocationController(this)
    private entitiesController = new EntitiesController(this)    
    private entitiesCalled = false

    initialize(): void {
        const canvas = this.context.canvas
        if (canvas != null) {
            const playerControls = new PlayerControls(
                "hero",
                canvas,
                4,
                true,
                this.context.sceneController,
                this.context.sceneController
            )
            this.geolocationController.trackPosition()
            this.context.sceneController.switchSkyboxIfNeeded(
                "com.demensdeum.blue.field"
            )
            this.context.sceneController.addModelAt(
                "hero",
                "com.demensdeum.hero",
                0,
                -1,
                -1.6,
                0,
                0,
                0,
                false,
                playerControls
            )
            this.context.sceneController.addModelAt(
                "floor",
                "com.demensdeum.floor",
                0,
                -2,
                0,
                0,
                0,
                0,
                false,
                playerControls
            )
        }
    }

    step(): void {
        if (this.position != null && this.entitiesCalled != true) {
            this.entitiesController.getEntities(this.position)
            this.entitiesCalled = true
        }
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
        var i = 0
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
            self.context.sceneController.addModelAt(
                name,
                modelName,
                i,
                -1,
                -2,
                0,
                0,
                0,
                false,
                controls
            )
            i += 1
        })
    }
}