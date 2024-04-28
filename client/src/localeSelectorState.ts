import { State } from "./state.js";
import { DecorControls } from "./decorControls.js";
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js";
import { Utils } from "./utils.js";
import { InGameState } from "./inGameState.js"
import { SceneControllerDelegate } from "./sceneControllerDelegate.js";
import { SceneController } from "./sceneController.js";
import { debugPrint } from "./runtime.js";
declare function _t(key: string): string;

export class LocaleSelectorState extends State implements SceneControllerDelegate {
    private readonly switchMillisecondsTimeout = 8000
    private startDate = new Date()    

    initialize(): void {
        // const savedLocalization = window.localStorage.getItem("savedLocalization")
        // if (savedLocalization != null) {
        //     this.context.translator.locale = savedLocalization
        //     this.saveLocaleAndGoToInGameState()
        //     return
        // }
        this.context.sceneController.delegate = this
        this.context.sceneController.switchSkyboxIfNeeded(
            {
                name: "com.demensdeum.blue.field",
                environmentOnly: false
            }
        )
        this.context.sceneController.addModelAt(
            "englishman",
            "com.demensdeum.hero",
            0.32,
            -0.35,
            -1.23,
            0,
            Utils.angleToRadians(120),
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
            "russian",
            "com.demensdeum.cat.gray",
            -0.22,
            -0.35,
            -1.23,
            0,
            Utils.angleToRadians(200),
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

        Utils.showFlexElement(
            {name: "localeSelectorState"}
        )
    }

    public didSelectRussian() {
        this.context.translator.locale = "ru"
        this.saveLocaleAndGoToInGameState()
    }

    public didSelectEnglish() {
        this.context.translator.locale = "en"
        this.saveLocaleAndGoToInGameState()
    }

    step(): void {
        const diffMilliseconds = Math.abs((new Date().getTime() - this.startDate.getTime()))
        
        if (diffMilliseconds > this.switchMillisecondsTimeout) {
            this.context.translator.locale = "ru"
            this.saveLocaleAndGoToInGameState()
        }       
    }

    private saveLocaleAndGoToInGameState() {
        window.localStorage.setItem(
            "savedLocalization", 
            this.context.translator.locale
        )

        Utils.hideElement(
            {name: "localeSelectorState"}
        )

        const inGameState = new InGameState(
            "InGameState",
            this.context
          )
        
          this.context.sceneController.removeAllSceneObjectsExceptCamera()

        // @ts-ignore
        document.global_gameplay_inGameState = inGameState;
        
        this.context.transitionTo(inGameState)
    }

    sceneControllerDidPickSceneObjectWithName(_: SceneController, name: string): void {
        if (name == "russian") {
            this.context.translator.locale = "ru"
            this.saveLocaleAndGoToInGameState()
        }
        else if (name == "englishman") {
            this.context.translator.locale = "en"
            this.saveLocaleAndGoToInGameState()
        }
        else {
            debugPrint(`Unknown object picked: ${name}`)
        }
    }    
}