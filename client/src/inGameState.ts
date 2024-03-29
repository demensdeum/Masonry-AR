import { State } from "./state.js"
import { debugPrint, raiseCriticalError } from "./runtime.js"
import { MockGeolocationController } from "./mockGeolocationController.js"
import { GeolocationController } from "./geolocationController.js"
import { GeolocationControllerDelegate } from "./geolocationControllerDelegate.js"
import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { EntitiesController } from "./entitiesController.js"
import { MockEntitiesController } from "./mockEntitiesController.js"
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
import { HeroStatusControllerDelegate } from "./heroStatusControllerDelegate.js"
import { HeroStatusController } from "./heroStatusController.js"
import { BuildingStatusController } from "./buildingStatusController.js"
import { ServerInfoController } from "./serverInfoController.js"
import { ServerInfoControllerDelegate } from "./serverInfoControllerDelegate.js"
import { ServerInfoEntry } from "./serverInfoEntry.js"
import { EntitiesControllerInterface } from "./entitiesControllerInterface.js"
import { GeolocationControllerInterface } from "./geolocationControllerInterface.js"
import { InGameStateSceneController } from "./inGameStateSceneController.js"
import { MapScrollController } from "./mapScrollController.js"
import { InGameStateSceneControllerDelegate } from "./inGameStateSceneControllerDelegate.js"

export class InGameState extends State implements GeolocationControllerDelegate,
                                                    ServerInfoControllerDelegate,
                                                    AuthorizeControllerDelegate,
                                                    EntitiesControllerDelegate,
                                                    SceneControllerDelegate,
                                                    HeroStatusControllerDelegate,
                                                    InGameStateSceneControllerDelegate {
    name = "InGameState"
    
    private mapScrollController!: MapScrollController
    private buildingStatusController = new BuildingStatusController(this)
    private geolocationController!: GeolocationControllerInterface
    private entitiesController!: EntitiesControllerInterface
    private authorizeController = new AuthorizeController(this)
    private serverInfoController = new ServerInfoController(this)
    private heroStatusController = new HeroStatusController(this)
    private gameData = new GameData()
    private readonly cameraLockEnabled = false
    private readonly buildingEnabled = true
    private readonly orderChangeEnabled = true
    private readonly entitiesTrackingStepTimeout = 3000
    private readonly currentClientVersion = 5
    private heroInserted = false
    private lastBuildingAnimationObjectUUID = "NONE"
    private dataFetchType = "DEFAULT"
    private inGameStateSceneController!: InGameStateSceneController

    initialize(): void {

        if (this.dataFetchType == "MOCK") {
            this.geolocationController = new MockGeolocationController(this)
            const mockingEntitiesController = new MockEntitiesController(this)
            mockingEntitiesController.dataSource = this
            this.entitiesController = mockingEntitiesController
        }
        else if (this.dataFetchType == "MOCK-GEOLOCATION") {
            this.geolocationController = new MockGeolocationController(this)
            this.entitiesController = new EntitiesController(this)
        }
        else if (this.dataFetchType == "DEFAULT") {
            this.geolocationController = new GeolocationController(this)
            this.entitiesController = new EntitiesController(this)
        }

        const canvas = this.context.canvas
        if (canvas == null) {
            return
        }
        this.context.sceneController.delegate = this
        this.context.sceneController.switchSkyboxIfNeeded(
            "com.demensdeum.blue.field"
        )
        this.switchHeroModel(this.gameData.model)

        this.mapScrollController = new MapScrollController(
            this.context.sceneController
        )
        this.mapScrollController.initialize()

        this.context.sceneController.rotateObjectTo(
            Names.Camera,
            Utils.angleToRadians(-55),
            0,
            0
        )        

        this.context.sceneController.addText(
            "name",
            this.gameData
        )
        this.context.sceneController.addText(
            "balance",
            this.gameData
        )      
        this.context.sceneController.addText(
            "message",
            this.gameData
        )
        this.context.sceneController.addText(
            "order",
            this.gameData
        )

        if (this.orderChangeEnabled) {        
            let action = () => {
                this.switchOrder()
            }
            const button = {
                ["Order"] : action
            }
            this.context.sceneController.addButton(
                "Order",
                button
            )
        }

        if (this.buildingEnabled) {            
            let action = () => {
                this.build()
            }
            const button = {
                ["Build"] : action
            }
            this.context.sceneController.addButton(
                "Build",
                button
            )
        }

        this.gameData.message = "Authorization"
        this.serverInfoController.fetch()

        if (this.cameraLockEnabled) {
            this.context.sceneController.addText(
                "cameraLock",
                this.gameData
            )
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

        this.context.sceneController.setFog(
            0xb3ffcb,
            8,
            32
        )

        this.inGameStateSceneController = new InGameStateSceneController(
            this.context.sceneController,
            this
        )

        this.context.sceneController.addLight()
    }

    inGameStateControllerDidMoveCamera(
        _: InGameStateSceneController,
        x: number,
        __: number,
        z: number
    ) {
        this.mapScrollController.scroll(
            x * InGameStateSceneController.geolocationScale,
            -z * InGameStateSceneController.geolocationScale
        )
    }

    private build() {
        if (this.gameData.isLocationResolvedOnce() == false) {
            alert("Строить нельзя пока не будут определены ваши координаты!")
            return
        }
        if (this.gameData.geolocationPositionIsInSync() == false) {
            alert("Для постройки зданий сначала нужно остановиться и подождать (координаты на сервере и на клиенте разные)")
            return
        }
        this.showBuildingAnimation()
        this.entitiesController.build()
    }

    switchOrder() {
        const order = prompt("Название масонского ордена")
        if (order) {
            this.heroStatusController.set(order)
        }
    }

    mockEntitiesControllerDidRequestGeolocationPosition(
        _: MockEntitiesController
    ): GameGeolocationPosition {
        const position = this.gameData.playerClientGeolocationPosition
        if (position) {
            return position
        }
        else {
            raiseCriticalError("NO GEOPOSITION FOR MOCK!!!!!")
            return new GameGeolocationPosition(
                0.0, 
                0.0
            )
        }
    }

    private showBuildingAnimation() {
        if (this.lastBuildingAnimationObjectUUID != "NONE") {
            debugPrint("Can't present another building animation! Already presenting one!")
            return
        }
        const position = this.gameData.playerClientGeolocationPosition
        if (position == null) {
            return
        }
        const uuid = Utils.generateUUID()
        this.lastBuildingAnimationObjectUUID = uuid
        const entity = new Entity(
            -1,
            uuid,
            "BUILDING-ANIMATION",
            this.gameData.name,
            this.gameData.order,
            "building",
            "com.demensdeum.hitech.building",
            0,
            position
        )
        this.inGameStateSceneController.temporaryAdd(entity)
    }

    step() {
        this.inGameStateSceneController.step()
    }

    geolocationControllerDidGetPosition(
        _: GeolocationController,
        position: GameGeolocationPosition
    ) {
        this.gameData.playerClientGeolocationPosition = position.clone()

        if (window.localStorage.getItem("gameplayStartInfo") != "YES") {
            window.localStorage.setItem("gameplayStartInfo", "YES")
            alert("Ваши координаты определены. Для перемещения в игре ходите с устройством в реальной жизни, собирайте масонские знаки, и стройте здания за свой орден. Приятной игры!")
        }

        debugPrint(`gps!: ${position.latitude} - ${position.longitude}`)
        this.inGameStateSceneController.setCurrentPlayerGameGeolocation(position)
    }

    serverInfoControllerDidFetchInfo(
        _: ServerInfoController,
        entries: ServerInfoEntry[]
    ) {
        const minimalClientVersion = entries.filter((a) => { return a.key == "minimal_client_version" })[0]?.value

        if (!minimalClientVersion) {
            alert("Server info get error, minimal_client_version is null")
            return
        }
        if (parseInt(minimalClientVersion) > this.currentClientVersion) {
            alert(`Client is too old: ${this.currentClientVersion} / ${minimalClientVersion}`)
            return
        }

        this.authorizeController.authorizeIfNeeded()
    }

    geolocationControllerGeolocationAccessGranted(
        _: GeolocationController,
        position: GameGeolocationPosition
    ) {
        this.gameData.playerClientGeolocationPosition = position
        this.geolocationController.trackPosition()    
    }

    geolocationControllerGeolocationDidReceiveError(
        _: GeolocationController, 
        error: string
    ) {
        alert(error)
    }

    private switchHeroModel(model: string) {
        if (this.heroInserted == true) {
            this.context.sceneController.removeSceneObjectWithName("hero")
        }
        this.context.sceneController.addModelAt(
            "hero",
            model == "DEFAULT" ? "com.demensdeum.hero" : model,
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
        this.heroInserted = true
    }

    entitiesControllerDidFetchEntities(
        _: EntitiesController,
        entities: Entity[]
    ) {
        debugPrint(`entities: ${entities}`)

        this.inGameStateSceneController.handle(entities)
        this.entitiesTrackingStep()

        this.lastBuildingAnimationObjectUUID = "NONE"
    }

    entitiesControllerDidCatchEntity(
        _: EntitiesController, 
        entity: Entity
    ): void {
        this.inGameStateSceneController.remove([entity])
        // @ts-ignore        
        this.gameData.balance = parseInt(this.gameData.balance) + parseInt(entity.balance)
    }

    entitiesControllerDidNotCatchEntity(
        _: EntitiesController, 
        __: Entity, 
        message: string
    ): void {
        debugPrint(message)    
    }

    askIfWantToRemoveBuilding(entity: Entity) {
        if (this.gameData.order == entity.order) {
            if (confirm(`Это здание ${entity.name} вашего ордена ${entity.order} - построено ${entity.ownerName}. Переименовать?`)) {
                this.renameBuilding(entity)
            }
            return
        }
        else if (confirm(`Хотите уничтожить здание масонского ордена ${entity.order} - построено ${entity.ownerName} ?`)) {
            this.entitiesController.destroy(entity)
            return
        }
    }

    renameBuilding(entity: Entity) {
        const name = prompt("Введите название здания:") || "NONE"
        entity.name = name
        this.buildingStatusController.rename(entity, name)
    }

    entitiesControllerDidDestroyEntity(
        _: EntitiesController,
        entity: Entity
    ): void {
        this.inGameStateSceneController.remove([entity])
        //this.removeEntity(entity)
    }

    entitiesControllerDidNotDestroyEntity(
        _: EntitiesController, 
        __: Entity, 
        message: string
    ): void {
        alert(message);
    }

    sceneControllerDidPickSceneObjectWithName(
        _: SceneController, 
        name: string
    ): void {  
        const entity = this.inGameStateSceneController.sceneObjectNameToEntity(name)
        if (entity?.type == "eye") {
            this.entitiesController.catch(entity)
        }   
        else if (entity?.type == "building") {
            this.askIfWantToRemoveBuilding(entity)
            return
        }
        else {
            debugPrint(`Unknown entity type tap: ${entity?.type}`)
        }
    }

    private entitiesTrackingStep() {
        this.gameData.message = `${this.gameData.playerClientGeolocationPosition?.latitude} - ${this.gameData.playerClientGeolocationPosition?.longitude}`
        const position = this.gameData.playerClientGeolocationPosition
        if (position != null) {
            const self = this
            setTimeout(()=>{
                this.gameData.playerServerGeolocationPosition = position
                self.entitiesController.getEntities(position)
            }, self.entitiesTrackingStepTimeout)
        }
        else {
            const self = this
            setTimeout(()=>{
                self.entitiesTrackingStep()
            }, self.entitiesTrackingStepTimeout)
        }
    }

    authorizeControllerDidAuthorize(
        _: AuthorizeController
    ) {
        const heroUUID = Utils.getCookieValue("heroUUID")
        if (heroUUID) {
            this.gameData.heroUUID = heroUUID
            this.inGameStateSceneController.heroEntityUUID = heroUUID
            if (window.localStorage.getItem("showedStartInfo") != "YES") {
                window.localStorage.setItem("showedStartInfo", "YES")
                alert("Masonry-AR - это игра в дополненной реальности, потребуется доступ к вашей геолокации")
            }
            this.geolocationController.askPermission()
            this.entitiesTrackingStep()            
        }
        else {
            alert("No heroUUID in cookie!")
        }
    }

    authorizeControllerDidReceiveError(
        _: AuthorizeController,
        message: string
    ) {
        alert(`AuthorizeController error: ${message}`)
    }

    entitiesControllerDidBuildEntity(
        _: EntitiesController,
        __: Entity
    ): void {
        debugPrint("Build success")
    }

    entitiesControllerDidNotBuildEntity(
        _: EntitiesController,
        message: string
    ): void {
        alert(message)
    }

    heroStatusControllerDidChange(
        _: HeroStatusController, 
        order: string
    ): void {
        this.gameData.order = order
    }

    heroStatusControllerDidReceiveError(
        _: HeroStatusController,
        error: string
    ): void {
        alert(error)
    }

    buildingStatusControllerDidRename(
        _: BuildingStatusController, 
        __: string, 
        ___: string
    ) {
        debugPrint("Building rename success")
    }

    buildingStatusControllerDidReceiveError(
        _: BuildingStatusController, 
        string: string
    ) {
        alert(string)
    }
}