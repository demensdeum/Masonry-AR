import { State } from "./state.js"
import { debugPrint, raiseCriticalError } from "./runtime.js"
import { GeolocationController } from "./geolocationController.js"
import { GeolocationControllerDelegate } from "./geolocationControllerDelegate.js"
import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
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
import { HeroStatusControllerDelegate } from "./heroStatusControllerDelegate.js"
import { HeroStatusController } from "./heroStatusController.js"
import { BuildingStatusController } from "./buildingStatusController.js"
import { EntitiesControllerInterface } from "./entitiesControllerInterface.js"
import { GeolocationControllerInterface } from "./geolocationControllerInterface.js"
import { InGameStateSceneController } from "./inGameStateSceneController.js"
import { MapScrollController } from "./mapScrollController.js"
import { YadMapScrollController } from "./yadMapScrollController.js"
import { InGameStateSceneControllerDelegate } from "./inGameStateSceneControllerDelegate.js"
import { GameplayGuiController } from "./gameplayGuiController.js"
import { MiniMapController } from "./miniMapController.js"
import { WalkChallengeController } from "./walkChallengeController.js"
import { Context } from "./context.js"
import { Constants } from "./constants.js"
import { MockEntitiesController } from "./mockEntitiesController.js"
import { DataFetchType } from "./dataFetchType.js"
import { GameUtils } from "./gameUtils.js"
declare function _t(key: string): string
declare function _alert(args: {text: string, okCallback: ()=>void}): void
declare function _confirm(args: {text: string, okCallback: ()=>void, cancelCallback: ()=>void}): void

export class InGameState extends State implements GeolocationControllerDelegate,
                                                    EntitiesControllerDelegate,
                                                    SceneControllerDelegate,
                                                    HeroStatusControllerDelegate,
                                                    InGameStateSceneControllerDelegate {
    
    public name: string
    private mapController: MiniMapController
    private mapScrollController!: MapScrollController
    private buildingStatusController = new BuildingStatusController(this)
    private geolocationController: GeolocationControllerInterface
    private entitiesController!: EntitiesControllerInterface
    private heroStatusController = new HeroStatusController(this)
    private walkChallengeController = new WalkChallengeController()
    private gameData = new GameData()
    private readonly cameraLockEnabled = false
    private readonly buildingEnabled = true
    private readonly orderChangeEnabled = true
    private readonly entitiesTrackingStepTimeout = 3000
    public static readonly versionDate = `$PREPROCESSOR_CURRENT_DATE (${Constants.currentClientVersion})`
    private heroInserted = false
    private ownerNameEnabled = false
    private lastBuildingAnimationObjectUUID = "NONE"
    private inGameStateSceneController!: InGameStateSceneController
    private gameplayGuiController = new GameplayGuiController(this.gameData)
    private startingGeolocationPosition: GameGeolocationPosition
    private heroEntityUUID: string

    constructor(
        args: {
            name: string,
            context: Context,
            dataFetchType: DataFetchType,
            heroUUIDEntity: string,
            geolocationController: GeolocationControllerInterface,
            geolocationPosition: GameGeolocationPosition
        }
    )
    {
        super(
            args.name,
            args.context
        )
        this.name = args.name
        this.context = args.context
        this.geolocationController = args.geolocationController
        if (this.geolocationController instanceof GeolocationController) {
            this.geolocationController.reassign({delegate: this})
        }
        this.geolocationController = args.geolocationController
        this.startingGeolocationPosition = args.geolocationPosition
        this.heroEntityUUID = args.heroUUIDEntity
        this.mapController = new MiniMapController(this.startingGeolocationPosition, "map")

        switch (args.dataFetchType) {
            case DataFetchType.DEFAULT:
                this.entitiesController = new EntitiesController(this)
                break
            case DataFetchType.MOCK:
                this.entitiesController = new MockEntitiesController(this)
                break
            case DataFetchType.MOCK_GEOLOCATION_ONLY:
                this.entitiesController = new EntitiesController(this)
                break
        }        
    }

    initialize(): void {
        debugPrint(this.gameplayGuiController)
        Utils.showHtmlElement({name: "yandexCopyrightGUI"})

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
            Utils.degreesToRadians(-55),
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
            this.heroEntityUUID,
            this.context.sceneController,
            this
        )

        this.context.sceneController.addLight();

        (document.getElementsByClassName("gameplayGUI")[0] as HTMLElement).style.display = "block";

        this.context.sceneController.lockOrbitControls()

        this.mapController.initialize()
        this.entitiesTrackingStep()
        this.geolocationControllerDidGetPosition(this.geolocationController, this.startingGeolocationPosition)
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
            _alert({
                text:_t("CANT_BUILD_NO_CLIENT_COORDINATES"),
                okCallback: ()=>{}
            })
            return
        }
        if (this.gameData.geolocationPositionIsInSync() == false) {
            _alert({
                text: "Для постройки зданий сначала нужно остановиться и подождать (координаты на сервере и на клиенте разные)",
                okCallback: ()=>{}
            })
            return
        }
        if (this.gameData.order == "NONE") {
            _alert({
                text: "Для постройки здания задайте название своему ордену!",
                okCallback: ()=>{}
            })
            return
        }
        this.showBuildingAnimation()
        this.entitiesController.build()
    }

    switchOrder() {
        const orderValue = this.gameData.order == "NONE" ? "" : this.gameData.order
        this.context.sceneController.prompt({
            text: "Название масонского ордена", 
            value: orderValue,
            okCallback: (order)=>{
                if (order.length >= 4) {
                    this.heroStatusController.set(order)
                }
                else {
                    _alert({
                        text: "Название ордена должно быть не менее 4 символов",
                        okCallback: ()=>{}
                    })
                }                
            },
            cancelCallback: ()=>{}
        })
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
        _: GeolocationControllerInterface,
        position: GameGeolocationPosition
    ) {
        if (this.walkChallengeController.isStarted()) {
            this.walkChallengeController.add(position)
        }
        this.gameData.playerClientGeolocationPosition = position.clone()

        debugPrint(`gps!: ${position.latitude} - ${position.longitude}`)
        this.mapController.setPlayerLocationAndCenter(position)
        this.inGameStateSceneController.setCurrentPlayerGameGeolocation(position)
    }


    geolocationControllerGeolocationDidReceiveGeolocationOnce(
        _: GeolocationController,
        __: GameGeolocationPosition
    ) {  
    }

    geolocationControllerGeolocationPermissionDenied(_: GeolocationControllerInterface) {
        _alert({
            text: _t("GEOLOCATION_ACCESS_DENIED"),
            okCallback:()=>{GameUtils.gotoWiki({locale: this.context.translator.locale})}
        })
    }

    geolocationControllerGeolocationDidReceiveError(
        _: GeolocationController, 
        error: string
    ) {
        _alert({
            text: error,
            okCallback: ()=>{}
        })
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
        if (this.gameData.model == model) {
            return
        }
        this.gameData.model = model
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
            _confirm({
                text: _t("OWN_BUILDING_MESSAGE").replace("BUILDING_NAME", entity.name).replace("ORDER_NAME", entity.order),
                okCallback: ()=>{
                    this.renameBuilding(entity)                 
                },
                cancelCallback: ()=>{}
            })
            return
        }
        else {
            _confirm({
                text: _t("WANT_TO_DESTROY_BUILDING").replace("ORDER_NAME", entity.order).replace("OWNER_NAME", ownerName),
                okCallback: ()=>{this.entitiesController.destroy(entity)},
                cancelCallback: ()=>{}
            })
            
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
            _alert({
                text: _t("TOO_EARLY_FOR_ENTITIES_TIMEOUT_REQUEST_ERROR"),
                okCallback: ()=>{
                    const url = this.context.translator.locale == "ru" ? "https://demensdeum.com/masonry-ar-wiki-ru/" : "https://demensdeum.com/masonry-ar-wiki-en/"
                    window.location.assign(url)        
                }
            })
        }
        else {
            _alert({
                text: _t(message),
                okCallback: ()=>{}
            })
        }
    }

    entitiesControllerDidDestroyEntity(
        _: EntitiesController,
        entity: Entity
    ): void {
        this.inGameStateSceneController.remove([entity])
    }

    entitiesControllerDidNotDestroyEntityError(
        _: EntitiesController, 
        __: Entity, 
        message: string
    ): void {
        _alert({
            text:_t(message),
            okCallback: ()=>{}
        })
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
            // anti-alert <-> OrbitControls stuck on Chrome
            setTimeout(confirmation, 300)
            return
        }
        else if (entity?.type == "walkChallenge") {
            const geolocationPosition = this.gameData.playerClientGeolocationPosition
            if (geolocationPosition == null) {
                _alert({
                    text: "NO GEOLOCATION IN WALK CHALLENGE HUH?? CRITICAL ERROOR!!!! OINK!",
                    okCallback: ()=>{}
                })
                return
            }
            if (this.walkChallengeController.isNotStarted()) {
                _confirm({
                    text: _t("WALK_CHALLENGE_MESSAGE"),
                    okCallback: ()=>{
                        this.entitiesController.catch(entity)
                        this.walkChallengeController.start(geolocationPosition)
                    },
                    cancelCallback: ()=>{
                        this.entitiesController.catch(entity)
                    }
                })
            }
            else {
                const distance = this.walkChallengeController.distance()
                if (distance < 5000) {
                    const distanceValues = `${distance} / 5000`
                    _confirm({
                        text: _t("WALK_CHALLENGE_COUNTER").replace("DISTANCE_VALUES", distanceValues),
                        okCallback: ()=>{
                            this.walkChallengeController.clear()
                            this.entitiesController.catch(entity)
                        },
                        cancelCallback: ()=>{
                            this.entitiesController.catch(entity)
                        }
                    })
                }
                else {
                    _alert({
                        text: _t("WALK_CHALLENGE_FINISHED"),
                        okCallback: ()=>{
                            this.walkChallengeController.clear()
                            this.entitiesController.catch(entity)
                        }
                    })
                }
            }
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
            debugPrint("entitiesTrackingStep => no this.gameData.playerServerGeolocationPosition, waiting")
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
        _alert({
            text: message.replace("BUILD_ERROR_NOT_ENOUGH_MONEY", _t("BUILD_ERROR_NOT_ENOUGH_MONEY")),
            okCallback: ()=>{}
        })
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
        _alert({
            text: error,
            okCallback: ()=>{}
        })
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
        _alert({
            text: _t(string),
            okCallback: ()=>{}
        })
    }
}