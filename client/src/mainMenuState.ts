import { State } from "./state.js"
import { Context } from "./context.js"
import { InitializationScreenState } from "./initializationScreenState.js"
import { GameVector3 } from "./gameVector3.js"
declare function _t(key: string): string;

export class MainMenuState implements State {
    public name: string
    context: Context

    private readonly switchMillisecondsTimeout = 6000
    private startDate = new Date()    

    constructor(
        name: string,
        context: Context
    ) {
        this.name = name
        this.context = context
    }

    initialize() {
        this.context.sceneController.switchSkyboxIfNeeded(
            {
                name: "com.demensdeum.masonry.black",
                environmentOnly: false
            }
        )

        const self = this

        const playButtonDiv = document.createElement('div')
        playButtonDiv.onclick = () => {
            self.playButtonDidPress()
        }
        playButtonDiv.textContent = _t("PLAY_BUTTON")
        playButtonDiv.style.color = "white"
        playButtonDiv.style.backgroundColor = 'gray'  
        playButtonDiv.style.fontSize = "30px"
        playButtonDiv.style.padding = "22px"    

        this.context.sceneController.addCssPlaneObject(
            {
                name: "playButton",
                div: playButtonDiv,
                planeSize: {
                    width: 2,
                    height: 2
                },
                position: GameVector3.zeroBut(
                    {   
                        x: -0.4,
                        y: 3,
                        z: -5
                    }
                ),
                rotation: new GameVector3(
                    0,
                    0,
                    0,
                ),
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
            }
        )

        const wikiButtonDiv = document.createElement('div')
        wikiButtonDiv.onclick = () => {
            const url = "https://demensdeum.com/masonry-ar-wiki-ru/"
            window.location.assign(url)
        }
        wikiButtonDiv.textContent = _t("WIKI_BUTTON")
        wikiButtonDiv.style.color = "white"
        wikiButtonDiv.style.backgroundColor = 'gray'  
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
                position: GameVector3.zeroBut(
                    {   
                        x: -0.4,
                        y: 2,
                        z: -5
                    }
                ),
                rotation: new GameVector3(
                    0,
                    0,
                    0,
                ),
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
            }
        )              
    }

    step() {
        const diffMilliseconds = Math.abs((new Date().getTime() - this.startDate.getTime()))
        
        if (diffMilliseconds > this.switchMillisecondsTimeout) {
            this.playButtonDidPress()
        }       
    }

    public playButtonDidPress() {
        this.context.sceneController.removeAllSceneObjectsExceptCamera();
        
        const initializationScreenState = new InitializationScreenState(
            "initializationScreenState",
            this.context
        )

        this.context.transitionTo(initializationScreenState)
    }

}