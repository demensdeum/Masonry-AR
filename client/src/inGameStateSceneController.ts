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

export class InGameStateSceneController {

    private readonly geolocationScale = 2000
    private sceneController: SceneController
    private currentPlayerGameGeolocation?: GameGeolocationPosition
    private uuidToPair: { [key: string]: InGameStateSceneControllerStateItem} = {}

    constructor(
        sceneController: SceneController
    ) {
        this.sceneController = sceneController
    }

    public setCurrentPlayerGameGeolocation(geolocation: GameGeolocationPosition) {
        if (this.currentPlayerGameGeolocation) {
            const diff = this.currentPlayerGameGeolocation.diff(geolocation)            
            this.currentPlayerGameGeolocation = geolocation
            this.updatePositionsFromGeolocationDiff(diff)
        }
        else if (Object.keys(this.uuidToPair).length > 0) {
            raiseCriticalError("Do not update objects position, because this.currentPlayerGameGeolocation is null!")
            debugger
        }
        else {
            debugPrint("First geolocation set")
            this.currentPlayerGameGeolocation = geolocation
        }
    }

    private updatePositionsFromGeolocationDiff(diff: GameGeolocationPosition) {
        const diffX = diff.longitude * this.geolocationScale
        const diffZ = diff.latitude * this.geolocationScale
        debugPrint(`diffX: ${diffX}`)
        debugPrint(`diffZ: ${diffZ}`)
        const self = this
        Object.keys(this.uuidToPair).forEach((uuid) => {
            const e = self.uuidToPair[uuid]
            e.currentPosition.x += diffX
            e.currentPosition.z += diffZ

            e.targetPosition.x += diffX
            e.targetPosition.z += diffZ

            self.sceneController.moveObjectTo(
                e.sceneObjectUUID,
                e.currentPosition.x,
                e.currentPosition.y,
                e.currentPosition.z
            )    
            debugPrint("OVER DRIVE")        
            // debugger
        })        
    }

    public handle(entities: Entity[]) {
        debugPrint(`handle entity: ${entities}`)

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
        if (this.currentPlayerGameGeolocation) {
            const position = this.currentPlayerGameGeolocation
            const diffX = geolocation.longitude - position.longitude
            const diffY = geolocation.latitude - position.latitude        
            const adaptedX = diffX * this.geolocationScale
            const adaptedZ = -(diffY * this.geolocationScale)
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
                    controls
                )
                self.uuidToPair[e.uuid] = new InGameStateSceneControllerStateItem(
                    e,
                    sceneObjectUUID,
                    sceneVector,
                    sceneVector
                )
        })
    }

    private move(entities: Entity[]) {
        debugPrint(`move entities: ${entities.length}`)
        
        entities.forEach((e) => {
            const sceneVector = this.geolocationToSceneVector(
                e.position
            )         
            this.uuidToPair[e.uuid].targetPosition.populate(sceneVector)
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

    public step() {
        // const self = this
        // Object.keys(this.uuidToPair).forEach((uuid) => {
        //     const e = this.uuidToPair[uuid]
        //     const movedVector = e.currentPosition.movedVector(
        //         e.targetPosition,
        //         0.01
        //     )
        //     e.currentPosition.populate(movedVector)
        //     self.sceneController.moveObjectTo(
        //         e.sceneObjectUUID,
        //         e.currentPosition.x,
        //         e.currentPosition.y,
        //         e.currentPosition.z
        //     )
        // })
        // debugPrint("sttttteeeeeppp")
    }
}