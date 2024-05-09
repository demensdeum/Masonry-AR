import { Context } from "./context.js";
import { DecorControls } from "./decorControls.js";
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js";
import { State } from "./state.js"
import { GeolocationController } from "./geolocationController.js";
import { GeolocationControllerDelegate } from "./geolocationControllerDelegate.js";
import { GameGeolocationPosition } from "./gameGeolocationPosition.js";
import { GeolocationControllerInterface } from "./geolocationControllerInterface.js";
import { InGameState } from "./inGameState.js"
declare function _t(key: string): string;

export class InitializationScreenState implements State,
                                         GeolocationControllerDelegate {
    public name: string
    context: Context

    private geolocationController = new GeolocationController(this)

    private trackCheckStarted = false

    constructor(
        name: string,
        context: Context
    )
    {
        this.name = name
        this.context = context
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

    step(): void {
        if (window.localStorage.getItem("showedStartInfo") != "YES") {
            window.localStorage.setItem("showedStartInfo", "YES")
            if (confirm(_t("WELCOME"))) {
                this.geolocationController.trackPosition()
            }
            else {
                const url = this.context.translator.locale == "ru" ? "https://demensdeum.com/masonry-ar-wiki-ru/" : "https://demensdeum.com/masonry-ar-wiki-en/"
                window.location.assign(url)
            }
        }
        else if (this.trackCheckStarted != true) {
            this.trackCheckStarted = true
            this.geolocationController.trackPosition()
        }
    }

    geolocationControllerDidGetPosition(_: GeolocationControllerInterface, position: GameGeolocationPosition): void {
        this.context.sceneController.removeAllSceneObjectsExceptCamera()

        const inGameState = new InGameState(
            "InGameState",
            this.context,
            this.geolocationController,
            position
        )

        // @ts-ignore
        document.global_gameplay_inGameState = inGameState
        this.context.transitionTo(inGameState)        
    }

    geolocationControllerGeolocationDidReceiveError(_: GeolocationControllerInterface, error: string): void {
        alert(error)
    }

    geolocationControllerGeolocationDidReceiveGeolocationOnce(_: GeolocationControllerInterface, __: GameGeolocationPosition): void {
    }

    geolocationControllerGeolocationPermissionDenied(_: GeolocationControllerInterface): void {
        alert(_t("GEOLOCATION_ACCESS_DENIED"))
    }
}