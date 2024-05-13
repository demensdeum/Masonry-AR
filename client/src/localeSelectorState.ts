import { State } from "./state.js";
import { DecorControls } from "./decorControls.js";
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js";
import { Utils } from "./utils.js";
import { SceneControllerDelegate } from "./sceneControllerDelegate.js";
import { SceneController } from "./sceneController.js";
import { debugPrint } from "./runtime.js";
import { MainMenuState } from "./mainMenuState.js";
import { GameVector3 } from "./gameVector3.js";
declare function _t(key: string): string;

export class LocaleSelectorState extends State implements SceneControllerDelegate {
    private readonly switchMillisecondsTimeout = 30000
    private startDate = new Date()    

    initialize(): void {
        const savedLocalization = window.localStorage.getItem("savedLocalization")
        if (savedLocalization != null) {
            this.context.translator.locale = savedLocalization
            this.saveLocaleAndGoToInGameState()
            return
        }
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
            Utils.degreesToRadians(120),
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
            Utils.degreesToRadians(200),
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

        const russianButtonDiv = document.createElement('div')
        russianButtonDiv.textContent = "Русский"
        russianButtonDiv.style.color = "white"
        russianButtonDiv.style.backgroundColor = 'rgba(128, 128, 128, 0.5)'  
        russianButtonDiv.style.fontSize = "30px"
        russianButtonDiv.style.padding = "22px"    
        russianButtonDiv.onclick = () => { this.didSelectRussian() }

        this.context.sceneController.addCssPlaneObject(
            {
                name: "russianButton",
                div: russianButtonDiv,
                planeSize: {
                    width: 2,
                    height: 2
                },
                position: new GameVector3(
                        -0.8,
                        -2.35,
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
        
        const englishButtonDiv = document.createElement('div')
        englishButtonDiv.textContent = "English"
        englishButtonDiv.style.color = "white"
        englishButtonDiv.style.backgroundColor = 'rgba(128, 128, 128, 0.5)'  
        englishButtonDiv.style.fontSize = "30px"
        englishButtonDiv.style.padding = "22px"    
        englishButtonDiv.onclick = () => { this.didSelectEnglish() }

        this.context.sceneController.addCssPlaneObject(
            {
                name: "russianButton",
                div: englishButtonDiv,
                planeSize: {
                    width: 2,
                    height: 2
                },
                position: new GameVector3(
                        1.2,
                        -2.35,
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

        Utils.moveCssLayerFront()
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

        this.context.sceneController.removeAllSceneObjectsExceptCamera()

        const mainMenuState = new MainMenuState(
            "MainMenuState",
            this.context
        )

        // @ts-ignore
        document.global_gameplay_mainMenuState = mainMenuState

        this.context.transitionTo(mainMenuState)
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