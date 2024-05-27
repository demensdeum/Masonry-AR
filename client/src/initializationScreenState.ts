import { Context } from "./context.js"
import { GameInitializationController } from "./gameInitializationController.js"
import { GameInitializationControllerDelegate } from "./gameInitializationControllerDelegate.js"
import { ServerInfoController } from "./serverInfoController.js"
import { ServerInfoControllerDelegate } from "./serverInfoControllerDelegate.js"
import { DecorControls } from "./decorControls.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"
import { State } from "./state.js"
import { GeolocationController } from "./geolocationController.js"
import { GeolocationControllerDelegate } from "./geolocationControllerDelegate.js"
import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { GeolocationControllerInterface } from "./geolocationControllerInterface.js"
import { InGameState } from "./inGameState.js"
import { ServerInfoEntry } from "./serverInfoEntry.js"
import { Constants } from "./constants.js"
import { MockGeolocationController } from "./mockGeolocationController.js"
import { debugPrint, raiseCriticalError } from "./runtime.js"
import { DataFetchType } from "./dataFetchType.js"
import { GameVector3 } from "./gameVector3.js"
import { GameUtils } from "./gameUtils.js"
declare function _t(key: string): string
declare function _alert(args: {text: string, okCallback: ()=>void}): void

export class InitializationScreenState implements State,
                                         ServerInfoControllerDelegate,
                                         GameInitializationControllerDelegate,
                                         GeolocationControllerDelegate {
    public name: string
    context: Context

    private readonly gameInitializationController = new GameInitializationController(this)
    private readonly serverInfoController = new ServerInfoController(this)  
    private readonly geolocationController: GeolocationControllerInterface
    private readonly dataFetchType: DataFetchType = DataFetchType.DEFAULT

    private trackCheckStarted = false
    private outputPositon?: GameGeolocationPosition
    private outputHeroUUID = "NONE"
    private confirmationWindowShowed = false

    constructor(
        name: string,
        context: Context
    )
    {
        this.name = name
        this.context = context

        switch (this.dataFetchType) {
            case DataFetchType.DEFAULT:
                this.geolocationController = new GeolocationController(this)
                break
            case DataFetchType.MOCK:
                this.geolocationController = new MockGeolocationController(this)
                break
            case DataFetchType.MOCK_GEOLOCATION_ONLY:
                this.geolocationController = new MockGeolocationController(this)
                break
        }
    }

    initialize(): void {
        this.context.sceneController.switchSkyboxIfNeeded(
            {
                name: "com.demensdeum.white.box",
                environmentOnly: true
            }
        )

        this.context.sceneController.addModelAt(
            "kokeshi",
            "com.demensdeum.kokeshi",
            0,
            -1,
            -4,
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
        this.context.sceneController.objectPlayAnimation(
            "kokeshi",
            "Плоскость.004|Scene"
        )
    }

    private hideGeolocationPreloader() {
        this.context.sceneController.removeCssObjectWithName("geolocationLoadingDiv")
    }

    private showGeolocationPreloader() {
        const geolocationLoadingDiv = document.createElement('div')
        geolocationLoadingDiv.textContent = _t("GET_GEOLOCATION")
        geolocationLoadingDiv.style.color = "white"
        geolocationLoadingDiv.style.backgroundColor = 'rgba(128, 128, 128, 0.5)'  
        geolocationLoadingDiv.style.fontSize = "30px"
        geolocationLoadingDiv.style.padding = "22px"    

        this.context.sceneController.addCssPlaneObject(
            {
                name: "geolocationLoadingDiv",
                div: geolocationLoadingDiv,
                planeSize: {
                    width: 2,
                    height: 2
                },
                position: new GameVector3(
                        0,
                        0,
                        -5
                ),
                rotation: GameVector3.zero(),
                scale: new GameVector3(
                    0.01,
                    0.01,
                    0.01
                ),
                shadows: {
                    receiveShadow: false,
                    castShadow: false
                },
                display: {
                    isTop: true,
                    stickToCamera: true
                }
            },
        )              
    }

    step(): void {
        if (
            window.localStorage.getItem("gameRulesAccepted") != "YES" &&
            this.confirmationWindowShowed != true
        ) {
            this.confirmationWindowShowed = true
            this.context.sceneController.confirm({
                text: _t("WELCOME"),
                okCallback: () => {
                    window.localStorage.setItem("gameRulesAccepted", "YES")
                },
                cancelCallback: () => {
                    GameUtils.gotoWiki({locale: this.context.translator.locale})
                }
            })
        }
        else if (
            window.localStorage.getItem("gameRulesAccepted") == "YES" &&
            this.trackCheckStarted != true
        ) {
            this.trackCheckStarted = true
            this.serverInfoController.fetch()
            return
        }
    }

    geolocationControllerDidGetPosition(_: GeolocationControllerInterface, position: GameGeolocationPosition): void {
        this.outputPositon = position
        this.gameInitializationController.initialize()
    }

    geolocationControllerGeolocationDidReceiveError(_: GeolocationControllerInterface, error: string): void {
        _alert({text: error, okCallback: ()=>{}})
    }

    geolocationControllerGeolocationDidReceiveGeolocationOnce(_: GeolocationControllerInterface, __: GameGeolocationPosition): void {
    }

    geolocationControllerGeolocationPermissionDenied(_: GeolocationControllerInterface): void {
        this.hideGeolocationPreloader()
        _alert({
                text:_t("GEOLOCATION_ACCESS_DENIED"),
                okCallback: ()=>{
                    GameUtils.gotoWiki({locale: this.context.translator.locale})
                }
            })
    }

    serverInfoControllerDidFetchInfo(
        _: ServerInfoController,
        entries: ServerInfoEntry[]
    ) {
        const minimalClientVersion = entries.filter((a) => { return a.key == "minimal_client_version" })[0]?.value

        if (!minimalClientVersion) {
            _alert(
                {
                    text: "Server info get error, minimal_client_version is null",
                    okCallback: () => { GameUtils.gotoWiki({locale: this.context.translator.locale}) }
                }
            )
            return
        }
        if (parseInt(minimalClientVersion) > Constants.currentClientVersion) {
            _alert({
                    text: `${_t("CLIENT_IS_TOO_OLD")}: ${Constants.currentClientVersion} / ${minimalClientVersion}`,
                    okCallback: () => { GameUtils.gotoWiki({locale: this.context.translator.locale})}
            })
            return
        }

        this.showGeolocationPreloader()        
        this.geolocationController.trackPosition()
    }

    gameInitializationControllerDidAuthorize(
        _: GameInitializationController,
        heroUUID: string
    ) {
        if (heroUUID) {
            this.outputHeroUUID = heroUUID
            debugPrint(this.outputHeroUUID)
            if (this.outputPositon) {
                const position = this.outputPositon
                const gotoInGameState = () => {
                    this.context.sceneController.removeAllSceneObjectsExceptCamera()                    
                    const inGameState = new InGameState(
                    {
                        name: "InGameState",
                        context: this.context,
                        dataFetchType: this.dataFetchType,
                        heroUUIDEntity: heroUUID,
                        geolocationController: this.geolocationController,
                        geolocationPosition: position
                    }
                )
        
                // @ts-ignore
                document.global_gameplay_inGameState = inGameState
                this.context.transitionTo(inGameState)
                return                        
                }
                if (window.localStorage.getItem("gameplayStartInfo") != "YES") {
                    window.localStorage.setItem("gameplayStartInfo", "YES")
                    this.hideGeolocationPreloader()
                    _alert({
                        text: _t("LOCATION_GOT_WELCOME_MESSAGE"),
                        okCallback: gotoInGameState
                    })
                } 
                else {
                    gotoInGameState()
                }                 
            }
            else {
                raiseCriticalError("No output position!")
                debugger
                return
            }
        }
        else {
            _alert({
                text: "No heroUUID in cookie!",
                okCallback: ()=>{GameUtils.gotoWiki({locale:this.context.translator.locale})}
            })
            return
        }
    }

    gameInitializationControllerDidReceiveError(
        _: GameInitializationController,
        message: string
    ) {
        _alert({
            text:`AuthorizeController error: ${message}`,
            okCallback: ()=>{GameUtils.gotoWiki({locale:this.context.translator.locale})}
        })        
    }
}