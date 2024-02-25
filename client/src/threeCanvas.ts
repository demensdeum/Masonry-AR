// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { SceneController } from './sceneController.js';
import { Names } from './names.js'
import { PlayerControls } from "./playerControls.js";
import { SimplePhysicsController } from './simplePhysicsController.js';
import { EnemyControls } from './enemyControls.js';
import { debugPrint, raiseCriticalError } from './runtime.js';
import { DecorControls } from './decorControls.js';
import { GameSettings } from './gameSettings.js';
import { Utils } from './utils.js';

customElements.define('three-canvas',
    class extends HTMLElement {
        constructor() {
            super();
            this.playerControls = null;

            this.delegate = null;
            this.canvas = null;
            this.debugEnabled = false;
            this.previousMessage = "";

            this.resetInternalCanvas();
            this.innerHTML = "<canvas class=\"webgl\"></canvas>";

            this.graphicsCanvas = document.querySelector("canvas");           
            const flyMode = false;
            const gameSettings = GameSettings.loadOrDefault()

            if (this.graphicsCanvas == null) {
                console.log("CANVAS IS NULL WTF?????!!!!");
                return;
            }

            this.physicsController = new SimplePhysicsController(
                false
            );            

            this.sceneController = new SceneController(
                this.graphicsCanvas,
                this.physicsController,
                true,
                gameSettings,
                flyMode
            );          

            if (confirm("You AI?")) {
                this.playerControls = new EnemyControls(
                    "NONE",
                    this.sceneController,
                    this.sceneController
                );                    
            }
            else {
                this.playerControls = new PlayerControls(
                    "NONE",
                    this.graphicsCanvas,
                    gameSettings.mouseSensitivity,
                    true,
                    this.sceneController,
                    this.sceneController
                );
            } 

            document.threeCanvasDidLoad(this);

            const threeCanvas = this;
            const sceneController = this.sceneController;         

            const sceneControllerRender = () => {
                sceneController.step();
                
                if (threeCanvas.canvas != null) {
                    threeCanvas.canvas = {
                        "scene" : {
                            "name" : threeCanvas.canvas.scene.name,
                            "objects" : sceneController.serializedSceneObjects(),
                            "physicsEnabled" : threeCanvas.canvas.scene.physicsEnabled,
                            "commands" : threeCanvas.canvas.scene.commands
                        },
                        "message" : threeCanvas.canvas.message,
                        "userObjectName" : threeCanvas.canvas.userObjectName            
                    }
                    if (threeCanvas.delegate) {
                        threeCanvas.delegate.threeCanvasDidUpdateCanvas(threeCanvas, threeCanvas.canvas);
                    }
                    else {
                        console.log("threeCanvas.delegate is null - nowhere to signal!!!!");
                    }
                }

                requestAnimationFrame(sceneControllerRender);
            };

            sceneControllerRender(this, this.sceneController);
        }

        static get observedAttributes() {
            return ['scene-json'];
        }
        
        resetInternalCanvas() {
            this.canvas = {
                scene: {
                    name: "",
                    objects: {},
                    commands: {},
                    physicsEnabled: false
                },
                userObjectName: "",
                message: "Reset canvas"                
            };            
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (this.debugEnabled) {
                console.log("ThreeCanvas attribute changed!!!");
            }
            const canvasJson = newValue;
            const canvas = JSON.parse(canvasJson);
            this.render(canvas);
        }

        showErrorIfNeeded(canvas)
        {
            if (this.previousMessage != canvas.message) {
                this.previousMessage = canvas.message;
                if (canvas.message.startsWith("Elm-Side Error: ")) {
                    alert(canvas.message);
                }
            }
        }

        render(canvas)
        {
            this.sceneController.physicsEnabled = canvas.scene.physicsEnabled
            if (this.messageReaderInstalled != true) {
                this.messageReaderInstalled = true
                this.sceneController.addText("message", canvas)
                const onGameSettingsChange = (value: float) => {
                    this.playerControls.mouseSensitivity = value
                    this.sceneController.saveGameSettings()
                }
                this.sceneController.addValueFloat(
                    "mouseSensitivity",
                    this.sceneController.gameSettings,
                    1,
                    100,
                    onGameSettingsChange
                )
                this.sceneController.addValueFloat(
                    "frameDelay",
                    this.sceneController.gameSettings,
                    0,
                    100,
                    onGameSettingsChange
                )
            }
            this.showErrorIfNeeded(canvas);
            if (canvas.scene == null || canvas.scene == undefined) {
                debugPrint("AAAAAAHHH MODEL SCENE IS EMPTY - CAN'T RENDER!!!!!!");
                return;
            }
            
            if (this.canvas.scene.name != canvas.scene.name) {
                debugger;
                console.log("clear");
                this.resetInternalCanvas();
                this.sceneController.removeAllSceneObjectsExceptCamera();
                this.messageReaderInstalled = false;
            }

            this.sceneController.userObjectName = canvas.userObjectName;

            Object.values(canvas.scene.commands).forEach((command) => {
                
                const name = command.name
                const type = command.type
                const time = command.time
                const x = command.position.x
                const y = command.position.y
                const z = command.position.z
                const rX = command.rotation.x
                const rY = command.rotation.y
                const rZ = command.rotation.z
                var nextCommandName = command.nextCommand

                if (nextCommandName == "NONE") {
                    nextCommandName = null
                }

                if (this.canvas.scene.commands == undefined) {
                    debugger;
                }
                if (name in this.canvas.scene.commands) {
                    // debugPrint("Commands updating does not support")
                }
                else {
                    this.sceneController.addCommand(
                        name,
                        type,
                        time,
                        x,
                        y,
                        z,
                        rX,
                        rY,
                        rZ,
                        nextCommandName
                    );
                }
            })

            Object.values(canvas.scene.objects).forEach ((object) => {
                const name = object.name;
                const type = object.type;
                const textureName = object.texture.name;   

                const x = object.position.x;
                const y = object.position.y;
                const z = object.position.z;

                const rX = object.rotation.x;
                const rY = object.rotation.y;
                const rZ = object.rotation.z;

                const isMovable = object.isMovable;

                const modelName = object.model.name;
                const controlsName = object.controls?.name;
                const changeDate = object.changeDate

                if (this.debugEnabled) {
                    console.log("name: " + name + " x: " + x + " y: " + y + " z: " + z );
                }

                if (name in this.canvas.scene.objects) {
                    if (this.sceneController.isObjectWithNameOlderThan(name, changeDate)) {
                        this.sceneController.moveObjectTo(
                            name,
                            x,
                            y,
                            z
                        );
                        this.sceneController.rotateObjectTo(
                            name,
                            rX,
                            rY,
                            rZ
                        )
                    }
                }
                else {
                    if (type == "Skybox") {
                        this.sceneController.switchSkyboxIfNeeded(
                            textureName
                        )
                    }
                    else if (type == "Model") {
                        if (modelName == "default") {
                            this.sceneController.addBoxAt(
                                name,
                                x,
                                y,
                                z
                            )
                        }
                        else {                           
                            var controls = null;
                            if (controlsName == "player") {
                                this.playerControls.objectName = name;
                                controls = this.playerControls;
                            }
                            else if (controlsName == "decor") {
                                const commandName = object.controls.startCommand
                                if (commandName in canvas.scene.commands) {
                                    const command = this.sceneController.commandWithName(commandName)                                    
                                    
                                    controls = new DecorControls(
                                        name,
                                        command,
                                        this.sceneController,
                                        this.sceneController,
                                        this.sceneController
                                    )                                    
                                }
                                else {
                                    debugger;
                                    raiseCriticalError("Can't initialize decor controls with name: " + commandName + " there is no command with such name!")
                                }
                            }
                            this.sceneController.addModelAt(
                                name,
                                modelName,
                                x,
                                y,
                                z,
                                rX,
                                rY,
                                rZ,
                                isMovable,
                                controls
                            );    
                        }
                    }
                    else if (type == "Camera") {
                        this.canvas.scene.objects["Camera"] = this.sceneController.serializeSceneObject(Names.Camera);
                        this.sceneController.moveObjectTo(
                            Names.Camera,
                            x,
                            y,
                            z
                        )
                    }
                    else if (type == "Box") {
                        this.sceneController.addBoxAt(
                            name,
                            x,
                            y,
                            z
                        )                       
                        return;
                    }
                    else if (type == "Button") {
                        const self = this;
                        let action = () => {
                            debugPrint("Button " + name + " Pressed!!!")
                            self.delegate.threeCanvasButtonDidPress(
                                self,
                                name
                            )
                        }
                        var button = {
                            [name] : action
                        }
                        this.sceneController.addButton(
                            name,
                            button
                        )
                    }
                    else {
                        raiseCriticalError("Unknown object type: " + type + "; uhh what the hell???");
                    }
                }
            });
            this.canvas = canvas;
            if (this.debugEnabled) {
                //debugger;
            }
        }
    }
);