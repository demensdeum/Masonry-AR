import { State } from "./state.js"
import { debugPrint, raiseCriticalError } from "./runtime.js"
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
    
    private geolocationController = new GeolocationController(this)
    private entitiesController = new EntitiesController(this)    
    private authorizeController = new AuthorizeController(this)
    private sceneObjectUuidToEntity: { [key: string]: Entity } = {}
    private entityUuidToSceneObjectUuid: { [key: string]: string} = {}
    private gameData = new GameData()
    private readonly buildingEnabled = false

    initialize(): void {
        const canvas = this.context.canvas
        if (canvas == null) {
            return
        }
        this.context.sceneController.delegate = this
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
        this.context.sceneController.addText(
            "message",
            this.gameData
        )

        if (this.buildingEnabled) {
            const self = this;
            const controls = new DecorControls(
                "building",
                new SceneObjectCommandIdle(
                    "idle",
                    0
                ),
                self.context.sceneController,
                self.context.sceneController,
                self.context.sceneController
            )            
            let action = () => {
                this.entitiesController.build()
            }
            var button = {
                ["Build"] : action
            }
            this.context.sceneController.addButton(
                "Build",
                button
            )
        }

        this.gameData.cameraLock = false
        this.gameData.message = "Authorization"
        this.authorizeController.authorizeIfNeeded()

        this.context.sceneController.addText(
            "cameraLock",
            this.gameData
        )

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

    step(): void {
        if (this.gameData.cameraLock) {
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
    }

    geolocationControllerDidGetPosition(
        controller: GeolocationController,
        position: GeolocationPosition
    ) {
        this.gameData.position = position
        debugPrint(`Position: ${position.latitude}, ${position.longitude}`) 
    }

    private modelNameFromType(type: string) {
        if (type == "hero") {
            return "com.demensdeum.hero"
        }
        else if (type == "building") {
            return "com.demensdeum.hitech.building"
        }
        else if (type == "eye") {
            return "com.demensdeum.eye"
        }
        else {
            return "com.demensdeum.hero"
        }
    }

    geolocationControllerGeolocationAccessGranted(
        controller: GeolocationController,
        position: GeolocationPosition
    ) {
        this.gameData.position = position
        this.geolocationController.trackPosition()    
    }

    geolocationControllerGeolocationDidReceiveError(
        controller: GeolocationController, 
        error: string
    ) {
        alert(error)
    }

    entitiesControllerDidFetchEntities(
        controller: EntitiesController,
        entities: Entity[]
    ) {
        const self = this
        var i = 0.5

        const entityServerUuids = new Set<string>(entities.map((entity) => {return entity.uuid}))
        //debugger
        Object.keys(this.sceneObjectUuidToEntity).forEach((uuid) => {
            if (!entityServerUuids.has(uuid)) {
                const entity = this.sceneObjectUuidToEntity[uuid]
                if (entity == null) {
                    debugPrint(`Can't remove - no entity with UUID: ${uuid}`)
                    return
                }
                this.removeEntity(entity)
            }
        })

        entities.forEach((entity) => {

            if (entity.uuid == self.gameData.heroUUID) {
                self.gameData.balance = entity.balance
                return
            }

            if (entity.uuid in this.entityUuidToSceneObjectUuid) {
                const position = this.gameData.position  
                if (position == null) {
                    raiseCriticalError(`Position is null!`)
                    return
                }                              
                const diffX = entity.position.longitude - position.longitude
                const diffY = entity.position.latitude - position.latitude

                debugPrint(`diffX: ${diffX}; diffY: ${diffY}`)

                const scale = 2000
                const adaptedX = diffX * scale
                const adaptedZ = -(diffY * scale)    
                
                const uuid = entity.uuid
                this.context.sceneController.moveObjectTo(
                    uuid,
                    adaptedX,
                    0,
                    adaptedZ
                )
                if (entity.type == "eye") {
                    const colliderBoxName = `collider-box-${uuid}`
                    this.context.sceneController.moveObjectTo(
                        colliderBoxName,
                        adaptedX,
                        0.22,
                        adaptedZ
                    )
                }
            }
            else {   
                const uuid = entity.uuid
                const modelName = this.modelNameFromType(entity.type)

                const position = this.gameData.position
                if (position == null) {
                    raiseCriticalError(`Position is null!`)
                    return
                }

                const diffX = entity.position.longitude - position.longitude
                const diffY = entity.position.latitude - position.latitude

                debugPrint(`diffX: ${diffX}; diffY: ${diffY}`)

                const scale = 2000
                const adaptedX = diffX * scale
                const adaptedZ = -(diffY * scale)
                const controls = new DecorControls(
                    uuid,
                    new SceneObjectCommandIdle(
                        "idle",
                        0
                    ),
                    self.context.sceneController,
                    self.context.sceneController,
                    self.context.sceneController
                )
                if (entity.type == "eye") {
                    self.context.sceneController.addBoxAt(
                        `collider-box-${uuid}`,
                        adaptedX,
                        0.22,
                        adaptedZ,
                        "com.demensdeum.loading",
                        0.4,
                        0xFF00FF,
                        0.6
                    )
                }
                self.context.sceneController.addModelAt(
                    uuid,
                    modelName,
                    adaptedX,
                    0,
                    adaptedZ,
                    0,
                    0,
                    0,
                    false,
                    controls
                )
                i += 0.5

                self.sceneObjectUuidToEntity[uuid] = entity
                self.entityUuidToSceneObjectUuid[entity.uuid] = uuid
            }
        })
        this.entitiesTrackingStep()
    }

    private removeEntity(entity: Entity) {
        const sceneObjectUuid = this.entityUuidToSceneObjectUuid[entity.uuid]
        this.context.sceneController.removeSceneObjectWithName(sceneObjectUuid)
        this.context.sceneController.removeSceneObjectWithName(`collider-box-${sceneObjectUuid}`)

        const name = `${entity.type}-${entity.id}`
        delete this.entityUuidToSceneObjectUuid[entity.uuid]
        delete this.sceneObjectUuidToEntity[name]        
    }

    entitiesControllerDidCatchEntity(
        controller: EntitiesController, 
        entity: Entity
    ): void {
        this.removeEntity(entity)
        // @ts-ignore
        this.gameData.balance = parseInt(this.gameData.balance) + parseInt(entity.balance)
    }

    entitiesControllerDidNotCatchEntity(
        controller: EntitiesController, 
        entity: Entity, 
        message: string
    ): void {
        debugPrint(message)    
    }

    sceneControllerDidPickSceneObjectWithName(
        controller: SceneController, 
        name: string
    ): void {     
        if (name.startsWith("collider-box-")) {
            name = name.substring("collider-box-".length)
        }
        else {
            debugPrint(`Skip touch outside of collider-box: ${name}`)
            return
        }
        if (name in this.sceneObjectUuidToEntity == false) {
            return
        }
        const entity = this.sceneObjectUuidToEntity[name]

        this.entitiesController.catch(entity)      
    }

    private entitiesTrackingStep() {
        this.gameData.message = `${this.gameData.position?.latitude} - ${this.gameData.position?.longitude}`
        const position = this.gameData.position
        if (position != null) {
            const self = this
            setTimeout(()=>{
                self.entitiesController.getEntities(position)
            }, 1000)
        }
        else {
            const self = this
            setTimeout(()=>{
                self.entitiesTrackingStep()
            }, 1000)
        }
    }

    authorizeControllerDidAuthorize(
        controller: AuthorizeController
    ) {
        const heroUUID = Utils.getCookieValue("heroUUID")
        if (heroUUID) {
            this.gameData.heroUUID = heroUUID
            this.geolocationController.askPermission()
            this.entitiesTrackingStep()            
        }
        else {
            alert("No heroUUID in cookie!")
        }
    }

    authorizeControllerDidReceiveError(
        controller: AuthorizeController,
        message: string
    ) {
        alert(`AuthorizeController error: ${message}`)
    }

    entitiesControllerDidBuildEntity(
        controller: EntitiesController,
        entity: Entity
    ): void {
        const controls = new DecorControls(
            "building",
            new SceneObjectCommandIdle(
                "idle",
                0
            ),
            this.context.sceneController,
            this.context.sceneController,
            this.context.sceneController
        )        
        const sceneObjectName = `${entity.type}-${entity.id}`
        this.context.sceneController.addModelAt(
            sceneObjectName,
            this.modelNameFromType(entity.type),
            0,
            0,
            0,
            0,
            0,
            0,
            false,
            controls
        )
        this.entityUuidToSceneObjectUuid[entity.uuid] = sceneObjectName
        this.sceneObjectUuidToEntity[sceneObjectName] = entity   
    }

    entitiesControllerDidNotBuildEntity(
        controller: EntitiesController,
        entity: Entity,
        message: string
    ): void {
        alert(message)
    }
}