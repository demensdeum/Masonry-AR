import { Context } from "./context.js"
import { AuthorizeController } from "./authorizeController.js"
import { AuthorizeControllerDelegate } from "./authorizeControllerDelegte.js"
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
import { Utils } from "./utils.js"
import { MockGeolocationController } from "./mockGeolocationController.js"
import { debugPrint } from "./runtime.js"
import { DataFetchType } from "./dataFetchType.js"
import { GameVector3 } from "./gameVector3.js"
declare function _t(key: string): string;

export class InitializationScreenState implements State,
                                         ServerInfoControllerDelegate,
                                         AuthorizeControllerDelegate,
                                         GeolocationControllerDelegate {
    public name: string
    context: Context

    private readonly authorizeController = new AuthorizeController(this)
    private readonly serverInfoController = new ServerInfoController(this)  
    private readonly geolocationController: GeolocationControllerInterface
    private readonly dataFetchType: DataFetchType = DataFetchType.DEFAULT

    private trackCheckStarted = false
    private outputPositon?: GameGeolocationPosition
    private outputHeroUUID = "NONE"

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

        const wikiButtonDiv = document.createElement('div')
        wikiButtonDiv.textContent = _t("GET_GEOLOCATION")
        wikiButtonDiv.style.color = "white"
        wikiButtonDiv.style.backgroundColor = 'rgba(128, 128, 128, 0.5)'  
        wikiButtonDiv.style.fontSize = "30px"
        wikiButtonDiv.style.padding = "22px"    

        this.context.sceneController.addCssPlaneObject(
            {
                name: "wikiButton",
                div: wikiButtonDiv,
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
                }
            }
        )              
    }

    step(): void {
        if (window.localStorage.getItem("showedStartInfo") != "YES") {
            window.localStorage.setItem("showedStartInfo", "YES")
            if (confirm(_t("WELCOME"))) {
                this.serverInfoController.fetch()
                return
            }
            else {
                this.gotoWiki()
                return
            }
        }
        else if (this.trackCheckStarted != true) {
            this.trackCheckStarted = true
            this.serverInfoController.fetch()
            return
        }
    }

    private gotoWiki() {
        const url = this.context.translator.locale == "ru" ? "https://demensdeum.com/masonry-ar-wiki-ru/" : "https://demensdeum.com/masonry-ar-wiki-en/"
        window.location.assign(url)        
    }

    geolocationControllerDidGetPosition(_: GeolocationControllerInterface, position: GameGeolocationPosition): void {
        this.outputPositon = position
        this.authorizeController.authorizeIfNeeded()       
    }

    geolocationControllerGeolocationDidReceiveError(_: GeolocationControllerInterface, error: string): void {
        alert(error)
    }

    geolocationControllerGeolocationDidReceiveGeolocationOnce(_: GeolocationControllerInterface, __: GameGeolocationPosition): void {
    }

    geolocationControllerGeolocationPermissionDenied(_: GeolocationControllerInterface): void {
        alert(_t("GEOLOCATION_ACCESS_DENIED"))
    }

    serverInfoControllerDidFetchInfo(
        _: ServerInfoController,
        entries: ServerInfoEntry[]
    ) {
        const minimalClientVersion = entries.filter((a) => { return a.key == "minimal_client_version" })[0]?.value

        if (!minimalClientVersion) {
            alert("Server info get error, minimal_client_version is null")
            this.gotoWiki()
            return
        }
        if (parseInt(minimalClientVersion) > Constants.currentClientVersion) {
            alert(_t(`CLIENT_IS_TOO_OLD: ${Constants.currentClientVersion} / ${minimalClientVersion}`))
            this.gotoWiki()
            return
        }

        this.geolocationController.trackPosition()
    }

    authorizeControllerDidAuthorize(
        _: AuthorizeController
    ) {
        const heroUUID = Utils.getCookieValue("heroUUID")
        if (heroUUID) {
            this.outputHeroUUID = heroUUID
            debugPrint(this.outputHeroUUID)

            this.context.sceneController.removeAllSceneObjectsExceptCamera()
    
            if (this.outputPositon) {
                const inGameState = new InGameState(
                    {
                        name: "InGameState",
                        context: this.context,
                        dataFetchType: this.dataFetchType,
                        heroUUIDEntity: heroUUID,
                        geolocationController: this.geolocationController,
                        geolocationPosition: this.outputPositon
                    }
                )
        
                // @ts-ignore
                document.global_gameplay_inGameState = inGameState
                this.context.transitionTo(inGameState)
                return          
            }
            else {
                return
            }
        }
        else {
            alert("No heroUUID in cookie!")
            return
        }
    }

    authorizeControllerDidReceiveError(
        _: AuthorizeController,
        message: string
    ) {
        alert(`AuthorizeController error: ${message}`)
    }
}