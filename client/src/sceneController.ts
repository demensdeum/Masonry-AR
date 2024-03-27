import * as THREE from "three"

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader }  from 'three/examples/jsm/loaders/RGBELoader.js'
import { Utils } from "./utils.js"
import { SceneObject } from "./sceneObject.js"

import * as dat from "dat.gui"
import { Names } from "./names.js"
import { ControlsDataSource } from "./playerControlsDataSource.js"
import { ControlsDelegate } from "./controlsDelegate.js"
import { PhysicsController } from "./physicsController.js"
import { SimplePhysicsController } from "./simplePhysicsController.js"
import { SimplePhysicsControllerDelegate } from "./simplePhysicsControllerDelegate.js"
import { PhysicsControllerDelegate } from "./physicsControllerDelegate.js"
import { PhysicsControllerCollision } from "./physicsControllerCollision.js"
import { PhysicsControllerCollisionDirection } from "./physicsControllerCollisionDirection.js"
import { debugPrint, raiseCriticalError } from "./runtime.js"
import { float } from "./types.js"
import { Controls } from "./controls.js"
import { Paths } from "./paths.js"
import { WeatherControllerDelegate } from "./weatherControllerDelegate.js"
import { WeatherController } from "./weatherController.js"
import { int } from "./types.js"
import { SceneObjectCommandTeleport } from "./sceneObjectCommandTeleport.js"
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js"
import { DecorControlsDataSource } from "./decorControlsDataSource.js"
import { DecorControls } from "./decorControls.js"
import { SceneObjectCommand } from "./sceneObjectCommand.js"
import { SceneObjectCommandTranslate } from "./sceneObjectCommandTranslate.js"
import { GameSettings } from "./gameSettings.js"
import { ObjectsPickerController } from "./objectsPickerController.js"
import { ObjectsPickerControllerDelegate } from "./objectsPickerControllerDelegate.js"
import { SceneControllerDelegate } from "./sceneControllerDelegate.js"

const gui = new dat.GUI({ autoPlace: false });
var moveGUIElement = document.querySelector('.moveGUI');
var guiDomElement = gui.domElement;
moveGUIElement?.appendChild(guiDomElement);

export class SceneController implements 
                                        ControlsDataSource, 
                                        ControlsDelegate,
                                        PhysicsControllerDelegate,
                                        SimplePhysicsControllerDelegate,
                                        WeatherControllerDelegate,
                                        DecorControlsDataSource,
                                        ObjectsPickerControllerDelegate {

    public static readonly itemSize: number = 1;
    public static readonly carSize: number = 1;
    public static readonly roadSegmentSize: number = 2;
    public static readonly skyboxPositionDiff: number = 0.5;

    private userObjectName: string = ""
    private currentSkyboxName?: String | null

    private stepCounter: int = 0
    
    private scene: any;
    private camera: any;
    private renderer: any;
    private texturesToLoad: any[] = [];

    private textureLoader: any = new THREE.TextureLoader();
    private pmremGenerator: any;

    private clock = new THREE.Clock();
    private animationMixers: { [key: string]: THREE.AnimationMixer } = {}; 

    private objects: { [key: string]: SceneObject } = {};
    private objectsUUIDs: { [key: string]: SceneObject } = {};
    private commands: { [key: string]: SceneObjectCommand } = {};

    private loadingTexture: any;

    private physicsController: PhysicsController;
    private objectsPickerController: ObjectsPickerController

    private canMoveForward: boolean = false;
    private canMoveBackward: boolean = false;
    private canMoveLeft: boolean = false;
    private canMoveRight: boolean = false;

    private readonly wireframeRenderer = false

    public gameSettings: GameSettings;

    private flyMode: boolean = false;

    private weatherController?: WeatherController;

    public physicsEnabled: boolean;
    public delegate: SceneControllerDelegate | null = null

    private highQuality: boolean = false

    // @ts-ignore:next-line
    private debugControls: OrbitControls

    constructor(
        canvas: HTMLCanvasElement,
        physicsController: PhysicsController,
        physicsEnabled: boolean,
        gameSettings: GameSettings,
        flyMode: boolean = false
    ) {
        this.physicsEnabled = physicsEnabled
        this.gameSettings = gameSettings
        this.flyMode = flyMode
        this.physicsController = physicsController
        this.physicsController.delegate = this

        if (
            this.flyMode && 
            this.physicsController instanceof SimplePhysicsController
        ) {
            this.physicsController.enabled = false
        }

        if (physicsController instanceof SimplePhysicsController) {
            (physicsController as SimplePhysicsController).simplePhysicsControllerDelegate = this
        }

        this.loadingTexture = this.textureLoader.load(
            Paths.texturePath(
                "com.demensdeum.loading"
            )
        );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFFFFFF);
   
    this.camera = new THREE.PerspectiveCamera(
        75,
        this.windowWidth() / this.windowHeight(),
        0.1,
        1000
    )

    const cameraSceneObject = new SceneObject(
        Names.Camera,
        Names.Camera,
        "NONE",
        "NONE",
        this.camera,
        true,
        null,
        new Date().getTime()
    );

    this.objects[Names.Camera] = cameraSceneObject;    

      this.renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true
    })
    
      this.renderer.setSize(this.windowWidth(), this.windowHeight());
      if (this.highQuality) {
        this.renderer.setPixelRatio(window.devicePixelRatio)
      }
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping
      this.renderer.toneMappingExposure = 0.8

      this.objectsPickerController = new ObjectsPickerController(
        this.renderer,
        this.camera,
        this
      )

      this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.pmremGenerator.compileEquirectangularShader();

      document.body.appendChild(this.renderer.domElement);      
      
      const camera = this.camera;
      const renderer = this.renderer;

      const self = this

      const onWindowResize = () => {
        debugPrint("onWindowResize")
        camera.aspect = self.windowWidth() / self.windowHeight()
        camera.updateProjectionMatrix()
        renderer.setSize(self.windowWidth(), self.windowHeight())
      }      

      window.addEventListener("resize", onWindowResize, false);

      this.debugControls = new OrbitControls(
        camera, 
        renderer.domElement
      )      
    }

    public setFog(
        color: number = 0xcccccc,
        near: float = 10,
        far: float = 30
    ) {
        this.scene.fog = new THREE.Fog(
            color,
            near,
            far
        )
    }

    private windowWidth() {
        debugPrint("windowWidth: " + window.innerWidth)
        return window.innerWidth
    }

    private windowHeight() {
        debugPrint("windowHeight: " + window.innerHeight)
        return window.innerHeight
    }

    physicControllerRequireApplyPosition(
        objectName: string,
        _: PhysicsController,
        position: THREE.Vector3
    ): void {
        this.sceneObject(objectName).threeObject.position.x = position.x;
        this.sceneObject(objectName).threeObject.position.y = position.y;
        this.sceneObject(objectName).threeObject.position.z = position.z;
    }

    physicsControllerDidDetectFreeSpace(
        _: PhysicsController,
        __: SceneObject,
        direction: PhysicsControllerCollisionDirection
    ): void {
        switch (direction) {
            case PhysicsControllerCollisionDirection.Down:
                break
            case PhysicsControllerCollisionDirection.Front:
                this.canMoveForward = true
            case PhysicsControllerCollisionDirection.Back:
                this.canMoveBackward = true
            case PhysicsControllerCollisionDirection.Left:
                this.canMoveLeft = true
            case PhysicsControllerCollisionDirection.Right:
                this.canMoveRight = true
        }
    }

    physicsControllerDidDetectDistance(
        _: PhysicsController,
        collision: PhysicsControllerCollision
    ): void { 

        if (this.flyMode) {
            this.canMoveForward = true;
            this.canMoveBackward = true;
            this.canMoveLeft = true;
            this.canMoveRight = true;
        }

        const alice = collision.alice;
        const bob = collision.bob;
        const direction = collision.direction;
        const distance = collision.distance;

        if (
            alice.name == this.userObjectName &&
            bob.name == "Map" &&
            direction == PhysicsControllerCollisionDirection.Front
        ) {
            this.canMoveForward = distance > 0.3;
        }     
        
        if (
            alice.name == this.userObjectName &&
            bob.name == "Map" &&
            direction == PhysicsControllerCollisionDirection.Back
        ) {
            this.canMoveBackward = distance > 0.3;
        }
        
        if (
            alice.name == this.userObjectName &&
            bob.name == "Map" &&
            direction == PhysicsControllerCollisionDirection.Left
        ) {
            this.canMoveLeft = distance > 0.3;
        }         
        
        if (
            alice.name == this.userObjectName &&
            bob.name == "Map" &&
            direction == PhysicsControllerCollisionDirection.Right
        ) {
            this.canMoveRight = distance > 0.3;
        }            
    }

    simplePhysicControllerRequireToAddArrowHelperToScene(
        _: SimplePhysicsController,
        arrowHelper: any
    ) {
        this.scene.add(arrowHelper);
    }

    simplePhysicsControllerRequireToDeleteArrowHelperFromScene(
        _: SimplePhysicsController,
        arrowHelper: any
    ): void {
        this.scene.remove(arrowHelper);
    }
    
    public decorControlsDidRequestCommandWithName(
        _: DecorControls,
        commandName: string
    ): SceneObjectCommand
    {
        if (commandName in this.commands) {
            return this.commands[commandName]
        }
        else {
            raiseCriticalError("SceneController DecorControlsDataSource Error: No command with name " + commandName);
            return new SceneObjectCommandIdle("Error Placeholder", 0);
        }
    }

    public isObjectWithNameOlderThan(
        name: string,
        date: int
    )
    {
        const objectChangeDate = this.sceneObject(name).changeDate

        if (name.startsWith("Udod")) {
            debugPrint(objectChangeDate + " < " + date)
        }

        return objectChangeDate < date
    }

    public controlsQuaternionForObject(
        _: Controls,
        objectName: string
    ): any
    {
        const sceneObject = this.sceneObject(
            objectName
        );

        return sceneObject.threeObject.quaternion;
    }

    controlsRequireJump(
        _: Controls,
        objectName: string
    ) {
        const sceneObject = this.sceneObject(objectName);
        this.physicsController.requireJump(sceneObject);
    }

    public controlsRequireObjectTranslate(
        _: Controls,
        objectName: string,
        x: float,
        y: float,
        z: float
    ) {
        this.translateObject(
            objectName,
            x,
            y,
            z
        )
    }

    public controlsRequireObjectRotation(
        _: Controls,
        objectName: string, 
        euler: any
    ) {
        const sceneObject = this.sceneObject(
            objectName
        )
        sceneObject.threeObject.quaternion.setFromEuler(euler)
        sceneObject.changeDate = Utils.timestamp()
    }

    controlsCanMoveLeftObject(
        _: Controls,
        __: string
    ) {
        return this.canMoveLeft;
    }

    controlsCanMoveRightObject(
        _: Controls,
        __: string
    ) {
        return this.canMoveRight;
    }

    controlsCanMoveForwardObject(
        _: Controls,
        __: string
    ) {
        return this.canMoveForward;
    }

    controlsCanMoveBackwardObject(
        _: Controls,
        __: string
    ) {
        return this.canMoveBackward;
    }

    weatherControllerDidRequireToAddInstancedMeshToScene(
        _: WeatherController,
        instancedMesh: any
    ): void {
        this.scene.add(instancedMesh);
    }

    public addCommand(
        name: string,
        type: string,
        time: int,
        x: float,
        y: float,
        z: float,
        rX: float,
        rY: float,
        rZ: float,
        nextCommandName: string
    )
    {
        const position = new THREE.Vector3(
            x,
            y,
            z
        )
        const rotation = new THREE.Vector3(
            rX,
            rY,
            rZ
        )
        if (type == "teleport") {
            const command = new SceneObjectCommandTeleport(
                name,
                time, 
                position,
                rotation,
                nextCommandName
            )
            this.commands[name] = command
            return command
        }
        else if (type == "translate") {
            const translate = position
            const command = new SceneObjectCommandTranslate(
                name,
                time,
                translate,
                nextCommandName
            )
            this.commands[name] = command
            return command
        }
        
        raiseCriticalError("Unknown type for command parser: " + type);

        return new SceneObjectCommandIdle(
            name,
            time
        )
    }

    public commandWithName(
        name: string
    ) {
        return this.commands[name]
    }

    public addText(
        name: string, 
        object: any,
        userInteractionsEnabled: boolean = false
    ) {
        const field = gui.add(
            object,
            name            
        )

        if (userInteractionsEnabled == false) {
            field.domElement.style.pointerEvents = "none"
        }
    }    

    public addValueFloat(
        name: string,
        object: any,
        minimal: float,
        maximal: float,
        onChange: (value: float)=>{}
    )
    {
        gui.add(
            object,
            name,
            minimal,
            maximal
        ).onChange(
            onChange
        )
    }

    public saveGameSettings() {
        this.gameSettings.save();
    }

    public step() {
        this.stepCounter += 1

        if (this.gameSettings.frameDelay != 0 && Math.floor(this.stepCounter % this.gameSettings.frameDelay) != 0) {
            return
        }

        const delta = this.clock.getDelta();
        this.controlsStep(
            delta
        );
        if (this.physicsController) {
            if (this.physicsController instanceof SimplePhysicsController) {
                this.physicsController.enabled = this.physicsEnabled
            }
            this.physicsController.step(delta);
        }
        this.weatherController?.step(delta);
        this.animationsStep(delta);
        this.updateSkyboxPosition();
        this.render();
        this.updateUI();
    }

    private controlsStep(
        delta: float
    ) {
        Object.keys(this.objects).forEach(key => {
            const sceneObject = this.objects[key];
            const controls = sceneObject.controls;
            controls?.step(delta);  
        })
    }

    private updateSkyboxPosition() {
        if (!this.currentSkyboxName) {
            return;
        }
        const cameraPosition = this.camera.position;
        this.moveObjectTo(
            Names.Skybox + "Front",
            cameraPosition.x,
            cameraPosition.y,
            cameraPosition.z - SceneController.skyboxPositionDiff
        );        
        this.moveObjectTo(
            Names.Skybox + "Back",
            cameraPosition.x,
            cameraPosition.y,
            cameraPosition.z + SceneController.skyboxPositionDiff
        );        
        this.moveObjectTo(
            Names.Skybox + "Top",
            cameraPosition.x,
            cameraPosition.y + SceneController.skyboxPositionDiff,
            cameraPosition.z
        );       
        this.moveObjectTo(
            Names.Skybox + "Bottom",
            cameraPosition.x,
            cameraPosition.y - SceneController.skyboxPositionDiff,
            cameraPosition.z
        );           
        this.moveObjectTo(
            Names.Skybox + "Left",
            cameraPosition.x - SceneController.skyboxPositionDiff,
            cameraPosition.y,
            cameraPosition.z
        );
        this.moveObjectTo(
            Names.Skybox + "Right",
            cameraPosition.x + SceneController.skyboxPositionDiff,
            cameraPosition.y,
            cameraPosition.z
        );                                              
    }

    private animationsStep(delta: any) {
        Object.keys(this.animationMixers).forEach((animationName) => {
            const animationMixer = this.animationMixers[animationName]
            animationMixer.update(delta)
        })
    }    

    private render() {
        this.renderer.render(this.scene, this.camera);
    }

    private addSceneObject(sceneObject: SceneObject): void {
        const alreadyAddedObject = sceneObject.name in this.objects

        if (alreadyAddedObject) {
            debugger
            raiseCriticalError("Duplicate name for object!!!:" + sceneObject.name)
            return;
        }

        this.objectsUUIDs[sceneObject.uuid] = sceneObject
        this.objects[sceneObject.name] = sceneObject
        this.scene.add(sceneObject.threeObject)

        this.physicsController.addSceneObject(sceneObject)
        this.objectsPickerController.addSceneObject(sceneObject)
    }

    public serializedSceneObjects(): any {
        const keys = Object.keys(this.objects);
        const output = keys.map(key => ({ [key]: this.objects[key].serialize() }));
        const result = output.reduce((acc, obj) => ({ ...acc, ...obj }), {});
        return result;
    }

    public serializeSceneObject(name: string): any {
        const output = this.objects[name];
        output.serialize();
        return output;
    }

    public addButton(
        name: string, 
        object: any
    ) {
        gui.add(
            object,
            name
        )

        const boxSize: number = 1

        const boxGeometry = new THREE.BoxGeometry(
            boxSize, 
            boxSize, 
            boxSize
        )
        const material = new THREE.MeshBasicMaterial({
             color: "white",
             map: this.loadingTexture,
             transparent: true,             
             opacity: 0
        });    

        const box = new THREE.Mesh(boxGeometry, material);
        box.position.x = 0;
        box.position.y = 0;
        box.position.z = 0;

        const buttonSceneObject = new SceneObject(
            name,
            "Button",
            "",
            "",
            box,
            false,
            null,
            new Date().getTime()
        )
        this.objects[name] = buttonSceneObject
    }

    public updateUI() {
        for (const i in gui.__controllers) {
            gui.__controllers[i].updateDisplay();
        }
    }

    public removeAllSceneObjectsExceptCamera() {
        Object.keys(this.objects).map(k => {
            if (k == Names.Camera) {
                return
            }
            this.removeObjectWithName(k)
        });
        
        this.currentSkyboxName = null

        for (const i in gui.__controllers) {
            gui.remove(gui.__controllers[i]);
        }
        Object.keys(this.objects).map(k => {
            delete this.commands[k]
        })
    }

    private removeObjectWithName(name: string) {
        const sceneObject = this.objects[name]
        if (sceneObject == null) {
            raiseCriticalError(`removeObjectWithName: ${name} is null! WTF1!!`)
            debugger
            return
        }
        this.physicsController.removeSceneObject(sceneObject)
        this.objectsPickerController.removeSceneObject(sceneObject)
        this.scene.remove(sceneObject.threeObject)
        delete this.objects[name]
        delete this.objectsUUIDs[sceneObject.uuid]
    }

    private removeCurrentSkybox() {
        if (this.currentSkyboxName == null) {
            return
        }

        const names = [
            Names.Skybox + "Front",
            Names.Skybox + "Back",
            Names.Skybox + "Left",
            Names.Skybox + "Right",
            Names.Skybox + "Top",
            Names.Skybox + "Bottom",
        ]

        names.forEach((e) => {
            this.removeObjectWithName(e)
        })
    }

    public switchSkyboxIfNeeded(
        name: string
    ): void {
        debugPrint("switchSkyboxIfNeeded");
        if (this.currentSkyboxName != null) {
            if (this.currentSkyboxName != name) {
                this.removeCurrentSkybox();
            }
            else {
                return
            }
        }
        this.currentSkyboxName = name;
        this.addPlaneAt(
            Names.Skybox + "Front",
            0,
            0,
            -SceneController.skyboxPositionDiff,
            1,
            1,
            Paths.skyboxFrontTexturePath(name),
            0xFFFFFF,
            true
        );

        this.addPlaneAt(
            Names.Skybox + "Back",
            0,
            0,
            SceneController.skyboxPositionDiff,
            1,
            1,
            Paths.skyboxBackTexturePath(name),
            0xFFFFFF,
            true
        );    

        this.rotateObjectTo(
            Names.Skybox + "Back",
            0,
            Utils.angleToRadians(180),
            0            
        );        

        this.addPlaneAt(
            Names.Skybox + "Top",
            0,
            SceneController.skyboxPositionDiff,
            0,
            1,
            1,
            Paths.skyboxTopTexturePath(name),
            0xFFFFFF,
            true
        );

        this.rotateObjectTo(
            Names.Skybox + "Top",
            Utils.angleToRadians(90),
            0,
            0
        );       
        
        this.addPlaneAt(
            Names.Skybox + "Bottom",
            0,
            -SceneController.skyboxPositionDiff,
            0,
            1,
            1,
            Paths.skyboxBottomTexturePath(name),
            0xFFFFFF,
            true
        );

        this.rotateObjectTo(
            Names.Skybox + "Bottom",
            Utils.angleToRadians(90),
            Utils.angleToRadians(180),
            Utils.angleToRadians(180)
        );            

        this.addPlaneAt(
            Names.Skybox + "Left",
            -SceneController.skyboxPositionDiff,
            0,
            0,
            1,
            1,
            Paths.skyboxLeftTexturePath(name),
            0xFFFFFF,
            true
        );

        this.rotateObjectTo(
            Names.Skybox + "Left",
            0,
            Utils.angleToRadians(90),
            0
        );

        this.addPlaneAt(
            Names.Skybox + "Right",
            SceneController.skyboxPositionDiff,
            0,
            0,
            1,
            1,
            Paths.skyboxRightTexturePath(name),
            0xFFFFFF,
            true
        );

        this.rotateObjectTo(
            Names.Skybox + "Right",
            0,
            Utils.angleToRadians(270),
            0
        );

        const pmremGenerator = this.pmremGenerator;

      new RGBELoader()
      .setDataType(THREE.HalfFloatType)
      .setPath("./" + Paths.assetsDirectory + "/")  
      .load(Paths.environmentPath(name), (texture) => {
        var environmentMap = pmremGenerator.fromEquirectangular(texture).texture;
        this.scene.environment = environmentMap;
        texture.dispose();
        pmremGenerator.dispose();      
      });        
    }

    public addModelAt(
        name: string,
        modelName: string,
        x: number,
        y: number,
        z: number,
        rX: number,
        rY: number,
        rZ: number,
        isMovable: boolean,        
        controls: Controls,
        boxSize: number = 1.0,
        successCallback: (()=>void) = ()=>{},     
        color: number = 0xFFFFFF,
        transparent: boolean = false,
        opacity: float = 1.0
    ): void {
        debugPrint("addModelAt");

        const boxGeometry = new THREE.BoxGeometry(
            boxSize, 
            boxSize, 
            boxSize
        );

        const boxMaterial = new THREE.MeshBasicMaterial({
             color: color,
             map: this.loadingTexture,
             transparent: true,             
             opacity: 0.7
        });     

        const box = new THREE.Mesh(
            boxGeometry,
            boxMaterial
        );
        box.position.x = x;
        box.position.y = y;
        box.position.z = z;

        box.rotation.x = rX;
        box.rotation.y = rY;
        box.rotation.z = rZ;

        const sceneController = this;

        const sceneObject = new SceneObject(
            name,
            "Model",
            "NONE",
            modelName,
            box,
            isMovable,
            controls,
            new Date().getTime()
        );
        sceneController.addSceneObject(sceneObject);

        const modelLoader = new GLTFLoader();
        const modelPath = Paths.modelPath(modelName);

        const self = this

        modelLoader.load(
          modelPath,
          function (container) {
            if ((sceneObject.uuid in self.objectsUUIDs) == false) {
                debugPrint(`Don't add model for object name ${sceneObject.name}, because it's removed`)
                return
            }

            const model = container.scene;

            self.scene.add(model)

            model.position.x = box.position.x
            model.position.y = box.position.y
            model.position.z = box.position.z

            model.rotation.x = box.rotation.x
            model.rotation.y = box.rotation.y
            model.rotation.z = box.rotation.z

            self.scene.remove(box)
            sceneObject.threeObject = model
            sceneObject.animations = container.animations

            model.traverse((entity) => {
                if ((<THREE.Mesh> entity).isMesh) {
                    const mesh = (<THREE.Mesh> entity);
                    if (transparent) {
                        (<THREE.Material> mesh.material).transparent = true;
                        (<THREE.Material> mesh.material).opacity = opacity;
                    }
                    sceneObject.meshes.push(mesh);
                    if (sceneController.wireframeRenderer) {
                        (<THREE.MeshBasicMaterial>mesh.material).wireframe = true;
                        (<THREE.MeshBasicMaterial>mesh.material).needsUpdate = true
                    }
                }
            })
            
            debugPrint(`Model load success: ${modelPath}`)
            successCallback();
          }
        );
    }

    public objectPlayAnimation(
        objectName: string,
        animationName: string
    )
    {
        const animationKey = `${objectName}_${animationName}`
        if (animationKey in this.animationMixers) {
            debugPrint(`animation already playing: ${animationName}`)
            return
        }

        const object = this.sceneObject(objectName)
        const model = object.threeObject
        const animationMixer = new THREE.AnimationMixer(model)
        const animation = object.animations.find((e) => { return e.name == animationName })
        if (animation == null) {
            debugPrint(`No animation with name: ${animationName}`)
            debugger
        }
        else {
            debugPrint(`Start animation play: ${animationKey}`)
            animationMixer.clipAction(animation).play()
            this.animationMixers[animationKey] = animationMixer
        }
    }

    public objectStopAnimation(
        objectName: string,
        animationName: string
    )
    {
        const animationKey = `${objectName}_${animationName}`        
        if (animationKey in this.animationMixers) {
            delete this.animationMixers[animationKey]
        }
        else {
            debugPrint(`Can't stop animation, because not playing: ${animationKey}}`)
        }
    }

    public addBoxAt(
        name: string,
        x: number,
        y: number,
        z: number,
        textureName: string = "com.demensdeum.failback",    
        size: number = 1.0,            
        color: number = 0xFFFFFF,
        transparent: boolean = false,
        opacity: number = 1.0
    ): void {
        debugPrint("addBoxAt: " + x + " " + y + " " + z);
        const texturePath = Paths.texturePath(textureName);

        const boxGeometry = new THREE.BoxGeometry(
            size, 
            size, 
            size
        )

        const material = new THREE.MeshBasicMaterial({
             color: color,
             map: this.loadingTexture,
             transparent: transparent,             
             opacity: opacity
        })

        const newMaterial = new THREE.MeshBasicMaterial({
            color: color,
            map: this.textureLoader.load(
                texturePath,
                (texture: THREE.Texture) => {
                    material.map = texture;
                    material.needsUpdate;
                },
                (error: unknown) => {
                    console.log(`WUT!!!! Error: ${error}`);
                }
            ),
            transparent: true,
            opacity: opacity
       });        
       this.texturesToLoad.push(newMaterial);        

        const box = new THREE.Mesh(boxGeometry, material);
        box.position.x = x;
        box.position.y = y;
        box.position.z = z;

        const sceneObject = new SceneObject(
            name,
            "Box",
            textureName,
            "NONE",
            box,
            false,
            null,
            new Date().getTime()
        );
        sceneObject.meshes.push(box)
        this.addSceneObject(sceneObject)
    }

    public addPlaneAt(
        name: string,
        x: number,
        y: number,
        z: number,
        width: number,
        height: number,
        textureName: string,
        color: number = 0xFFFFFF,
        resetDepthBuffer: boolean = false,
        transparent: boolean = false,
        opacity: number = 1.0
    ): void {
        debugPrint("addPlaneAt");
        const texturePath = Paths.texturePath(textureName);
        const planeGeometry = new THREE.PlaneGeometry(width, height);

        const material = new THREE.MeshBasicMaterial({
            color: color,
            map: this.loadingTexture,
            depthWrite: !resetDepthBuffer,
            side: THREE.DoubleSide,
            transparent: transparent,
            opacity: opacity
        });

        const newMaterial = new THREE.MeshBasicMaterial({
            color: color,
            map: this.textureLoader.load(
                texturePath,
                (texture: THREE.Texture)=>{
                    material.map = texture;
                    material.needsUpdate = true;
                },
                (error: unknown)=>{
                    console.log(`WUT! Error: ${error}`);
                }),
            depthWrite: !resetDepthBuffer,
            side: THREE.DoubleSide,
            transparent: transparent,
            opacity: opacity
        });
        if (newMaterial.map != null) {
            this.texturesToLoad.push(newMaterial);
        }        

        const plane = new THREE.Mesh(planeGeometry, material);
        plane.position.x = x;
        plane.position.y = y;
        plane.position.z = z;
        if (resetDepthBuffer) {
            plane.renderOrder = -1;
        }

        const sceneObject = new SceneObject(
            name,
            "Plane",
            textureName,
            "NONE",
            plane,
            false,
            null,
            new Date().getTime()
        );
        this.addSceneObject(sceneObject);
    }    

    objectsPickerControllerDidPickObject(
        _: ObjectsPickerController,
        object: SceneObject
    ) {
        debugPrint(`pick: ${object.name}`)
        if (this.delegate != null) {
            this.delegate.sceneControllerDidPickSceneObjectWithName(
                this,
                object.name
            )
        }
    }

    public removeSceneObjectWithName(
        name: string
    ): void
    {
        this.removeObjectWithName(
            name
        )
    }

    public sceneObjectPosition(
        name: string
    ): any
    {
        const outputObject = this.sceneObject(name);
        const outputPosition = outputObject.threeObject.position;
        return outputPosition;
    }

    public objectCollidesWithObject(
        alisaName: string,
        bobName: string
    ): boolean
    {
        const alisa = this.sceneObject(alisaName);
        const bob = this.sceneObject(bobName);
        const alisaColliderBox = new THREE.Box3().setFromObject(alisa.threeObject);
        const bobCollider = new THREE.Box3().setFromObject(bob.threeObject);
        const output = alisaColliderBox.intersectsBox(bobCollider);
        return output;
    }

    private sceneObject(
        name: string,
        x: number = 0,
        y: number = 0,
        z: number = 0
    ): SceneObject
    {
        var object = this.objects[name];
        if (!object || object == undefined) {
            debugPrint("Can't find object with name: {"+ name +"}!!!!!");
            if (name == Names.Skybox) {
                debugPrint("But it's skybox so don't mind!")
            }
            else {
                debugger
                raiseCriticalError("Adding dummy box with name: " + name);
                this.addBoxAt(
                    name, 
                    x, 
                    y, 
                    z,
                    "com.demensdeum.failback.texture.png",
                    1
                );
            }
            return this.sceneObject(name);
        }
        return object;
    }

    controlsRequireObjectTeleport(
        _: Controls,
        name: string,
        x: number,
        y: number,
        z: number
    ): void {
        const sceneObject = this.sceneObject(
            name
        );

        sceneObject.threeObject.position.x = x;
        sceneObject.threeObject.position.y = y;
        sceneObject.threeObject.position.z = z;
    }

    public translateObject(
        name: string,
        x: float,
        y: float,
        z: float
    ): void {
        const sceneObject = this.sceneObject(
            name
        );
        sceneObject.threeObject.translateX(x);
        sceneObject.threeObject.translateY(y);
        sceneObject.threeObject.translateZ(z);
        sceneObject.changeDate = Utils.timestamp()
    }

    public moveObjectTo(
        name: string,
        x: number,
        y: number,
        z: number
    ): void {
        const sceneObject = this.sceneObject(
            name,
            x,
            y,
            z
        );
        sceneObject.threeObject.position.x = x;
        sceneObject.threeObject.position.y = y;
        sceneObject.threeObject.position.z = z;
        sceneObject.changeDate = Utils.timestamp()
    }

    public rotateObjectTo(
        name: string,
        x: number,
        y: number,
        z: number
    ): void
    {
        const sceneObject = this.sceneObject(name);
        sceneObject.threeObject.rotation.x = x;
        sceneObject.threeObject.rotation.y = y;
        sceneObject.threeObject.rotation.z = z;
        sceneObject.changeDate = Utils.timestamp()
    }  
}