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
import { GameData } from "./gameData.js"
import { AuthorizeController } from "./authorizeController.js"
import { AuthorizeControllerDelegate } from "./authorizeControllerDelegte.js"

export class InGameState extends State implements GeolocationControllerDelegate,
                                                    AuthorizeControllerDelegate,
                                                    EntitiesControllerDelegate,
                                                    SceneControllerDelegate {
    name = "InGameState"
    
    private position: GeolocationPosition | null = null
    private geolocationController = new GeolocationController(this)
    private entitiesController = new EntitiesController(this)    
    private authorizeController = new AuthorizeController(this)
    private sceneObjectNameToEntity: { [key: string]: Entity } = {}
    private entityUuidToSceneObjectName: { [key: string]: string} = {}
    private gameData = new GameData()

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
            this.context.sceneController.addText(
                "balance",
                this.gameData
            )

            const self = this;
            let action = () => {
                debugPrint("Button build pressed!!!")
            }
            var button = {
                ["Build"] : action
            }
            this.context.sceneController.addButton(
                "Build",
                button
            )            
        }
    }

    step(): void {
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

        this.authorizeController.authorize()
    }

    entitiesControllerDidFetchEntities(
        controller: EntitiesController,
        entities: Entity[]
    ) {
        const self = this
        var i = 0.5
        entities.forEach((entity)=>{

            if (entity.uuid == self.gameData.heroUuid) {
                self.gameData.balance = entity.balance
                return
            }

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
            self.entityUuidToSceneObjectName[entity.uuid] = name
        })
    }

    entitiesControllerDidCatchEntity(
        controller: EntitiesController, 
        entity: Entity
    ): void {
        const sceneObjectName = this.entityUuidToSceneObjectName[entity.uuid]
        this.context.sceneController.removeSceneObjectWithName(sceneObjectName)
        this.context.sceneController.removeSceneObjectWithName(`collider-box-${sceneObjectName}`)
        // @ts-ignore
        this.gameData.balance = parseInt(this.gameData.balance) + parseInt(entity.balance)
    }

    entitiesControllerDidNotCatchEntity(
        controller: EntitiesController, 
        entity: Entity, 
        message: string
    ): void {
        alert(message)    
    }

    sceneControllerDidPickSceneObjectWithName(
        controller: SceneController, 
        name: string
    ): void {        
        if (name.startsWith("collider-box-")) {
            name = name.substring("collider-box-".length)
        }
        if (name in this.sceneObjectNameToEntity == false) {
            return
        }
        const entity = this.sceneObjectNameToEntity[name]

        this.entitiesController.catch(entity)      
    }

    authorizeControllerDidAuthorize(
        controller: AuthorizeController
    ) {
        if (this.position) {
            const heroUuid = Utils.getCookieValue("heroUuid")
            if (heroUuid) {
                this.gameData.heroUuid = heroUuid 
                this.entitiesController.getEntities(this.position)
            }
            else {
                debugPrint("No heroUuid in cookie!")
            }
        }
    }

    authorizeControllerDidReceiveError(
        controller: AuthorizeController,
        message: string
    ) {
        alert(`AuthorizeController error: ${message}`)
    }
}