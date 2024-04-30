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
import { YadMapScrollController } from "./yadMapScrollController.js"
import { InGameStateSceneControllerDelegate } from "./inGameStateSceneControllerDelegate.js"
import { GameplayGuiController } from "./gameplayGuiController.js"
import { MiniMapController } from "./miniMapController.js"
declare function _t(key: string): string;

export class InGameState extends State implements GeolocationControllerDelegate,
                                                    ServerInfoControllerDelegate,
                                                    AuthorizeControllerDelegate,
                                                    EntitiesControllerDelegate,
                                                    SceneControllerDelegate,
                                                    HeroStatusControllerDelegate,
                                                    InGameStateSceneControllerDelegate {
    name = "InGameState"
    
    private mapController = new MiniMapController("map")
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
    private static currentClientVersion = 5
    public static readonly versionDate = `$PREPROCESSOR_CURRENT_DATE (${this.currentClientVersion})`
    private heroInserted = false
    private ownerNameEnabled = false
    private lastBuildingAnimationObjectUUID = "NONE"
    private dataFetchType = "DEFAULT"
    private inGameStateSceneController!: InGameStateSceneController
    private gameplayGuiController = new GameplayGuiController(this.gameData)

    initialize(): void {
        debugPrint(this.gameplayGuiController)
        Utils.showElement({name: "yandexCopyrightGUI"})
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
            {
                name: "com.demensdeum.white.box",
                environmentOnly: true
            }
        )
        this.switchHeroModel(this.gameData.model)

        this.mapScrollController = new YadMapScrollController(
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
            0xFFFFFF,
            4,
            14
        )

        this.inGameStateSceneController = new InGameStateSceneController(
            this.context.sceneController,
            this
        )

        this.context.sceneController.addLight();

        (document.getElementsByClassName("gameplayGUI")[0] as HTMLElement).style.display = "block";

        this.context.sceneController.lockOrbitControls()

        this.mapController.initialize()
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
            alert(_t("CANT_BUILD_NO_CLIENT_COORDINATES"))
            return
        }
        if (this.gameData.geolocationPositionIsInSync() == false) {
            alert("Для постройки зданий сначала нужно остановиться и подождать (координаты на сервере и на клиенте разные)")
            return
        }
        if (this.gameData.order == "NONE") {
            alert("Для постройки здания задайте название своему ордену!")
            return
        }
        this.showBuildingAnimation()
        this.entitiesController.build()
    }

    switchOrder() {
        const orderValue = this.gameData.order == "NONE" ? "" : this.gameData.order
        const order = prompt("Название масонского ордена", orderValue)
        if (order) {
            if (order.length >= 4) {
                this.heroStatusController.set(order)
            }
            else {
                alert("Название ордена должно быть не менее 4 символов")
            }
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
        this.gameplayGuiController.step()
    }

    geolocationControllerDidGetPosition(
        _: GeolocationController,
        position: GameGeolocationPosition
    ) {
        this.gameData.playerClientGeolocationPosition = position.clone()

        if (window.localStorage.getItem("gameplayStartInfo") != "YES") {
            window.localStorage.setItem("gameplayStartInfo", "YES")
            alert(_t("LOCATION_GOT_WELCOME_MESSAGE"))
        }

        debugPrint(`gps!: ${position.latitude} - ${position.longitude}`)
        this.mapController.setPlayerLocationAndCenter(position)
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
        if (parseInt(minimalClientVersion) > InGameState.currentClientVersion) {
            alert(`Client is too old: ${InGameState.currentClientVersion} / ${minimalClientVersion}`)
            return
        }

        this.authorizeController.authorizeIfNeeded()
    }

    geolocationControllerGeolocationDidReceiveGeolocationOnce(
        _: GeolocationController,
        __: GameGeolocationPosition
    ) {  
    }

    geolocationControllerGeolocationDidReceiveError(
        _: GeolocationController, 
        error: string
    ) {
        alert(error)
    }

    inGameStateControllerDidReceiveName(
        _: InGameStateSceneController,
        name: string
    ): void {
        this.gameData.name = name
    }

    inGameStateControllerDidReceiveBalance(
        _: InGameStateSceneController,
        balance: number
    ): void {
        this.gameData.balance = balance
    }

    inGameStateControllerDidReceiveOrder(
        _: InGameStateSceneController,
        order: string
    ): void {
        this.gameData.order = order
    }

    inGameStateControllerDidReceiveHeroModel(
        _: InGameStateSceneController, 
        model: string
    ): void {
        this.switchHeroModel(model)
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
        this.mapController.showEntities(entities)
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
        const ownerName = this.ownerNameEnabled ? ` - построено ${entity.ownerName}` : ""
        if (this.gameData.order == entity.order) {
            if (confirm(_t("OWN_BUILDING_MESSAGE").replace("BUILDING_NAME", entity.name).replace("ORDER_NAME", entity.order))) {
                this.renameBuilding(entity)
            }
            return
        }
        else if (confirm(`Хотите уничтожить здание масонского ордена ${entity.order}${ownerName} ?`)) {
            this.entitiesController.destroy(entity)
            return
        }
    }

    renameBuilding(entity: Entity) {
        const name = prompt("Введите название здания:") || "NONE"
        entity.name = name
        this.buildingStatusController.rename(entity, name)
    }

    entitiesControllerDidNotFetchEntities(
        _: EntitiesControllerInterface,
        message: string
    ): void {
        if (message == "TOO_EARLY_FOR_ENTITIES_TIMEOUT_REQUEST_ERROR") {
            alert(_t("TOO_EARLY_FOR_ENTITIES_TIMEOUT_REQUEST_ERROR"))
            window.location.assign("https://demensdeum.com")
        }
        else {
            alert(_t(message))
        }
    }

    entitiesControllerDidDestroyEntity(
        _: EntitiesController,
        entity: Entity
    ): void {
        this.inGameStateSceneController.remove([entity])
        //this.removeEntity(entity)
    }

    entitiesControllerDidNotDestroyEntityError(
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
            const self = this
            const confirmation = () =>{
                self.askIfWantToRemoveBuilding(entity)
            }
            // anti-alert <-> OrbitControls stuck for Chrome
            setTimeout(confirmation, 300)
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
                alert(_t("WELCOME"))
            }
            this.geolocationController.trackPosition()
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

    entitiesControllerDidNotBuildEntityError(
        _: EntitiesController,
        message: string
    ): void {
        
        alert(message.replace("BUILD_ERROR_NOT_ENOUGH_MONEY", _t("BUILD_ERROR_NOT_ENOUGH_MONEY")))
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
        alert(_t(string))
    }
}