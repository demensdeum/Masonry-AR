import { Entity } from "./entity.js"
import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { GameVector3 } from "./gameVector3.js"
import { debugPrint, raiseCriticalError } from "./runtime.js"
import { float } from "./types.js"
import { DecorControls } from "./decorControls.js"
import { SceneController } from "./sceneController.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"
import { Utils } from "./utils.js";
import { InGameStateSceneControllerStateItem } from "./InGameStateSceneControllerStateItem.js"
import { InGameStateSceneControllerDelegate } from "./inGameStateSceneControllerDelegate.js"

export class InGameStateSceneController {

    static geolocationScale = 5000
    private sceneController: SceneController
    private renderingPlayerGameGeolocation?: GameGeolocationPosition
    private actualPlayerGameGeolocation?: GameGeolocationPosition
    private uuidToPair: { [key: string]: InGameStateSceneControllerStateItem} = {}
    private delegate: InGameStateSceneControllerDelegate

    public heroEntityUUID = "NONE"
    private readonly cameraSpeed = 0.000002
    private readonly entitiesSpeed = 0.000002

    constructor(
        sceneController: SceneController,
        delegate: InGameStateSceneControllerDelegate
    ) {
        this.sceneController = sceneController
        this.delegate = delegate
    }

    public setCurrentPlayerGameGeolocation(geolocation: GameGeolocationPosition) {
        if (this.renderingPlayerGameGeolocation) {           
            this.actualPlayerGameGeolocation = geolocation
        }
        else if (Object.keys(this.uuidToPair).length > 0) {
            raiseCriticalError("Do not update objects position, because this.currentPlayerGameGeolocation is null!")
            debugger
        }
        else {
            debugPrint("First geolocation set")
            this.actualPlayerGameGeolocation = geolocation
            this.renderingPlayerGameGeolocation = geolocation
        }
    }

    public temporaryAdd(entity: Entity) {
        this.add([entity])
    }

    public handle(entities: Entity[]) {
        debugPrint(`handle entity: ${entities}`)

        const heroEntity = entities.find(e => { return e.uuid == this.heroEntityUUID })
        if (heroEntity != null) {
            this.delegate.inGameStateControllerDidReceiveName(
                this,
                heroEntity.name
            )            
            this.delegate.inGameStateControllerDidReceiveBalance(
                this,
                heroEntity.balance
            )
            this.delegate.inGameStateControllerDidReceiveOrder(
                this,
                heroEntity.order
            )            
            this.delegate.inGameStateControllerDidReceiveHeroModel(
                this,
                heroEntity.model
            )
        }

        const addedEntities = entities.filter((e) => { return (e.uuid in this.uuidToPair) == false })
        const movedEntities = entities.filter((e) => { return e.uuid in this.uuidToPair})
        var removedEntities: Entity[] = []

        const entityServerUuids = new Set<string>(entities.map((e) => { return e.uuid }))
        Object.keys(this.uuidToPair).forEach((uuid) => {
            if (!entityServerUuids.has(uuid)) {
                const entity = this.uuidToPair[uuid].entity
                if (entity == null) {
                    debugPrint(`Can't remove - no entity with UUID: ${uuid}`)
                    return
                }
                removedEntities.push(entity)
            }
        })

        this.add(addedEntities)
        this.move(movedEntities)
        this.remove(removedEntities)
    }

    private geolocationToSceneVector(
        geolocation: GameGeolocationPosition,
        y: float = 0
    ): GameVector3 {
        if (this.renderingPlayerGameGeolocation) {
            const position = this.renderingPlayerGameGeolocation
            const diffX = geolocation.longitude - position.longitude
            const diffY = geolocation.latitude - position.latitude        
            const adaptedX = diffX * InGameStateSceneController.geolocationScale
            const adaptedZ = -(diffY * InGameStateSceneController.geolocationScale)
            return new GameVector3(
                adaptedX,
                y,
                adaptedZ
            )
        }
        raiseCriticalError("currentPlayerGameGeolocation is null!!!!")
        debugger
        return new GameVector3(
            0,
            0,
            0
        )
    }

    private modelNameFromEntity(entity: Entity) {
        if (entity.model == "DEFAULT") {
            const type = entity.type
            if (type == "hero") {
                return "com.demensdeum.hero"
            }
            else if (type == "building") {
                return "com.demensdeum.hitech.building"
            }
            else if (type == "eye") {
                return "com.demensdeum.eye"
            }
            else if (type == "walkChallenge") {
                return "com.demensdeum.pig"
            }
            else {
                return "com.demensdeum.hero"
            }
        }
        else {
            return entity.model
        }
    }    

    private add(entities: Entity[]) {
        debugPrint(`add entity: ${entities.length}`)

        const self = this
        entities.forEach((e) => {
                if (this.heroEntityUUID == e.uuid) {
                    return
                }
                const sceneObjectUUID = Utils.generateUUID()
                const modelName = this.modelNameFromEntity(e)
                const sceneVector = this.geolocationToSceneVector(
                    e.position
                )

                const controls = new DecorControls(
                    sceneObjectUUID,
                    new SceneObjectCommandIdle(
                        "idle",
                        0
                    ),
                    self.sceneController,
                    self.sceneController,
                    self.sceneController
                )
                const isTransparent = e.name == "BUILDING-ANIMATION"
                const transparency = isTransparent ? 0.4 : 1.0
                self.sceneController.addModelAt(
                    sceneObjectUUID,
                    modelName,
                    sceneVector.x,
                    sceneVector.y,
                    sceneVector.z,
                    0,
                    0,
                    0,
                    false,
                    controls,
                    1.0,
                    ()=>{},
                    0xFFFFFF,
                    isTransparent,
                    transparency
                )
                self.uuidToPair[e.uuid] = new InGameStateSceneControllerStateItem(
                    e,
                    sceneObjectUUID,
                    e.position,
                    e.position
                )

                if (e.type == "building") {
                    this.sceneController.objectPlayAnimation(
                        sceneObjectUUID,
                        "Take 001"
                    )
                }
        })
    }

    private move(entities: Entity[]) {
        debugPrint(`move entities: ${entities.length}`)
        
        entities.forEach((e) => {       
            this.uuidToPair[e.uuid].actualPosition.populate(e.position)
        })
    }

    public sceneObjectNameToEntity(name: string): Entity | null {
        var outputEntity: Entity | null = null
        Object.keys(this.uuidToPair).forEach((uuid) => {
            const pair = this.uuidToPair[uuid]
            const entity = pair.entity
            const sceneObjectUUID = pair.sceneObjectUUID
            if (name == sceneObjectUUID) {
                outputEntity = entity
            }
        })
        return outputEntity
    }

    public remove(entities: Entity[]) {
        debugPrint(`remove entities: ${entities.length}`)

        const self = this
        entities.forEach((e) => {
            const uuid = self.uuidToPair[e.uuid].sceneObjectUUID
            self.sceneController.removeSceneObjectWithName(uuid);
            delete self.uuidToPair[e.uuid]
        })
    }

    private updateObjectsPosition() {
        const self = this

        var cameraDiffX = 0
        var cameraDiffY = 0
        var cameraDiffZ = 0

        if (this.renderingPlayerGameGeolocation && this.actualPlayerGameGeolocation) {
            var movedPosition = this.renderingPlayerGameGeolocation.movedPosition(
                this.actualPlayerGameGeolocation,
                this.cameraSpeed
            )

            var diff = this.renderingPlayerGameGeolocation.diff(
                this.actualPlayerGameGeolocation
            )

            const teleportThreshold = 0.001
            if (
                Math.abs(diff.latitude) >= teleportThreshold 
                || 
                Math.abs(diff.longitude) >= teleportThreshold
            ) {
                movedPosition = this.actualPlayerGameGeolocation    
            }

            diff = this.renderingPlayerGameGeolocation.diff(
                movedPosition
            )

            cameraDiffX = diff.longitude
            cameraDiffZ = diff.latitude

            const rotationY = Math.atan2(
                diff.latitude,
                diff.longitude,
            )

            if (
                Math.abs(diff.latitude) > 0.00000001
                || 
                Math.abs(diff.longitude) > 0.00000001
            ) {
                this.sceneController.rotateObjectTo(
                    "hero",
                    0,
                    Utils.angleToRadians(90) + rotationY,
                    0
                )
                this.sceneController.objectPlayAnimation(
                    "hero",
                    "walk"
                )
            }
            else {
                this.sceneController.objectStopAnimation(
                    "hero",
                    "walk"
                )
            }

            this.renderingPlayerGameGeolocation.populate(movedPosition)
        }

        Object.keys(this.uuidToPair).forEach((uuid) => {
            const e = this.uuidToPair[uuid]
            var movedPosition = e.renderingPosition.movedPosition(
                e.actualPosition,
                this.entitiesSpeed
            )
            const diff = e.renderingPosition.diff(
                e.actualPosition
            )

            const teleportThreshold = 0.001
            if (
                Math.abs(diff.latitude) >= teleportThreshold 
                || 
                Math.abs(diff.longitude) >= teleportThreshold
            ) {
                movedPosition = e.actualPosition   
            }
            
            const rotationY = Math.atan2(
                diff.latitude,
                diff.longitude
            )
            e.renderingPosition.populate(movedPosition)
            const currentVector = this.geolocationToSceneVector(
                e.renderingPosition
            )
            self.sceneController.moveObjectTo(
                e.sceneObjectUUID,
                currentVector.x,
                currentVector.y,
                currentVector.z
            )
            if (
                Math.abs(diff.latitude) > 0.00000001 
                || 
                Math.abs(diff.longitude) > 0.00000001
            ) {
                self.sceneController.rotateObjectTo(
                    e.sceneObjectUUID,
                    0,
                    Utils.angleToRadians(90) + rotationY,
                    0
                )
            }
        })         
        
        this.delegate.inGameStateControllerDidMoveCamera(
            this,
            cameraDiffX,
            cameraDiffY,
            cameraDiffZ
        )
    }

    public step() {
        this.updateObjectsPosition()


    }
}