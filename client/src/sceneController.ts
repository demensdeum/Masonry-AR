// @ts-ignore
import * as THREE from "three";

// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
// @ts-ignore
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
// @ts-ignore
import { RGBELoader }  from 'three/addons/loaders/RGBELoader.js'
import { Utils } from "./utils.js"
import { SceneObject } from "./sceneObject.js"
// @ts-ignore
import * as dat from "dat"
import { Names } from "./names.js"
import { ControlsDataSource } from "./playerControlsDataSource.js";
import { ControlsDelegate } from "./controlsDelegate.js";
import { PhysicsController } from "./physicsController.js";
import { SimplePhysicsController } from "./simplePhysicsController.js";
import { SimplePhysicsControllerDelegate } from "./simplePhysicsControllerDelegate.js";
import { PhysicsControllerDelegate } from "./physicsControllerDelegate.js";
import { PhysicsControllerCollision } from "./physicsControllerCollision.js";
import { PhysicsControllerCollisionDirection } from "./physicsControllerCollisionDirection.js";
import { debugPrint, raiseCriticalError } from "./runtime.js";
import { float } from "./types.js";
import { Vector3 } from "./vector3.js";
import { Controls } from "./controls.js";
import { Paths } from "./paths.js";
import { WeatherControllerDelegate } from "./weatherControllerDelegate.js";
import { WeatherController } from "./weatherController.js";
import { int } from "./types.js";
import { SceneObjectCommandTeleport } from "./sceneObjectCommandTeleport.js";
import { SceneObjectCommandIdle } from "./sceneObjectCommandIdle.js";
import { DecorControlsDataSource } from "./decorControlsDataSource.js";
import { DecorControls } from "./decorControls.js";
import { SceneObjectCommand } from "./sceneObjectCommand.js";
import { SceneObjectCommandTranslate } from "./sceneObjectCommandTranslate.js";
import { GameSettings } from "./gameSettings.js";
import { ObjectsPickerController } from "./objectsPickerController.js"
import { ObjectsPickerControllerDelegate } from "./objectsPickerControllerDelegate.js";
import { SceneControllerDelegate } from "./sceneControllerDelegate.js";

const gui = new dat.GUI();

export class SceneController implements 
                                        ControlsDataSource, 
                                        ControlsDelegate,
                                        PhysicsControllerDelegate,
                                        SimplePhysicsControllerDelegate,
                                        WeatherControllerDelegate,
                                        DecorControlsDataSource,
                                        ObjectsPickerControllerDelegate {

    private readonly collisionsDebugEnabled: boolean = false;

    public static readonly itemSize: number = 1;
    public static readonly carSize: number = 1;
    public static readonly roadSegmentSize: number = 2;
    public static readonly skyboxPositionDiff: number = 0.5;

    private userObjectName: string = ""
    private currentSkyboxName?: String | null

    private stepCounter: int = 0

    private debugControls: any
    
    // @ts-ignore
    private scene: any;
    private camera: any;
    private renderer: any;
    private texturesToLoad: any[] = [];
    // @ts-ignore
    private textureLoader: any = new THREE.TextureLoader();
    // @ts-ignore
    private pmremGenerator: any;

    private clock = new THREE.Clock();
    private animationMixers: any[] = []; 

    private objects: { [key: string]: SceneObject } = {};
    private commands: { [key: string]: SceneObjectCommand } = {};

    private failbackTexture: any;
    private loadingTexture: any;

    private physicsController: PhysicsController;
    private objectsPickerController: ObjectsPickerController

    private canMoveForward: boolean = false;
    private canMoveBackward: boolean = false;
    private canMoveLeft: boolean = false;
    private canMoveRight: boolean = false;

    public gameSettings: GameSettings;

    private flyMode: boolean = false;

    private weatherController?: WeatherController;

    public physicsEnabled: boolean;
    public delegate: SceneControllerDelegate | null = null

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

        const sceneController = this;

        if (physicsController instanceof SimplePhysicsController) {
            (physicsController as SimplePhysicsController).simplePhysicsControllerDelegate = this
        }
// @ts-ignore
        this.failbackTexture = this.textureLoader.load(
            Paths.texturePath(
                "com.demensdeum.failback"
            )
        );

        this.loadingTexture = this.textureLoader.load(
            Paths.texturePath(
                "com.demensdeum.loading"
            )
        );
// @ts-ignore
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFFFFFF);

// @ts-ignore      
    this.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
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
// @ts-ignore      
      this.renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true
    })
    
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 0.8;
      this.renderer.outputEncoding = THREE.sRGBEncoding;

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

      function onWindowResize() {
        // @ts-ignore
        camera.aspect = window.innerWidth / window.innerHeight;
        // @ts-ignore
        camera.updateProjectionMatrix();
        // @ts-ignore
        renderer.setSize(window.innerWidth, window.innerHeight);
      }      

      window.addEventListener("resize", onWindowResize, false);

      // this.weatherController = new SnowflakesController(this);
      this.weatherController?.initialize();    

      // @ts-ignore
      this.debugControls = new OrbitControls(
        camera, 
        renderer.domElement
      )      
    }

    physicControllerRequireApplyPosition(
        objectName: string,
        physicsController: PhysicsController,
        position: Vector3
    ): void {
        // @ts-ignore
        this.sceneObject(objectName).threeObject.position.x = position.x;
        // @ts-ignore
        this.sceneObject(objectName).threeObject.position.y = position.y;
        // @ts-ignore
        this.sceneObject(objectName).threeObject.position.z = position.z;
    }

    physicsControllerDidDetectFreeSpace(
        physicsController: PhysicsController,
        sceneObject: SceneObject,
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
        physicsController: PhysicsController,
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
        decorControls: DecorControls,
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
        controls: Controls,
        objectName: string
    ) {
        const sceneObject = this.sceneObject(objectName);
        this.physicsController.requireJump(sceneObject);
    }

    public controlsRequireObjectTranslate(
        controls: Controls,
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
        controls: Controls,
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
        controls: Controls,
        objectName: string
    ) {
        return this.canMoveLeft;
    }

    controlsCanMoveRightObject(
        controls: Controls,
        objectName: string
    ) {
        return this.canMoveRight;
    }

    controlsCanMoveForwardObject(
        controls: Controls,
        objectName: string
    ) {
        return this.canMoveForward;
    }

    controlsCanMoveBackwardObject(
        controls: Controls,
        objectName: string
    ) {
        return this.canMoveBackward;
    }

    weatherControllerDidRequireToAddInstancedMeshToScene(
        weatherController: WeatherController,
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
        const position = new Vector3(
            x,
            y,
            z
        )
        const rotation = new Vector3(
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
        // @ts-ignore
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
        // @ts-ignore
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
        this.animationMixers.forEach((n) => n.update(delta));
    }    

    private render() {
        this.renderer.render(this.scene, this.camera);
    }

    public loadTexture(
        path: string,
        material: any
    ): any {
        this.textureLoader.load(
            path,
            // @ts-ignore
            function (texture) {
                console.log("aaaa");
                material.texture = texture;
                material.needsUpdate = true;
            },
            // @ts-ignore
            function (error) {
                console.log("error");
                debugPrint("CANNOT LOAD TEXTURE: " + path);             
            }
        )
    }

    private addSceneObject(sceneObject: SceneObject): void {
        // @ts-ignore
        const alreadyAddedObject = sceneObject.name in this.objects

        if (alreadyAddedObject) {
            debugger
            raiseCriticalError("Duplicate name for object!!!:" + sceneObject.name)
            return;
        }

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
        // @ts-ignore
        gui.add(
            object,
            name
        )

        const boxSize: number = 1

        // @ts-ignore
        const boxGeometry = new THREE.BoxGeometry(
            boxSize, 
            boxSize, 
            boxSize
        );
        // @ts-ignore
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
            // @ts-ignore
            gui.remove(gui.__controllers[i]);
        }
        Object.keys(this.objects).map(k => {
            delete this.commands[k]
        })
    }

    private removeObjectWithName(name: string) {
        const sceneObject = this.objects[name]
        this.scene.remove(sceneObject.threeObject)
        delete this.objects[name]
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
        const sceneController = this;
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
// @ts-ignore
      new RGBELoader()
      .setDataType(THREE.HalfFloatType)
      .setPath("./" + Paths.assetsDirectory + "/")
// @ts-ignore      
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
    ): void {
        debugPrint("addModelAt");

        // @ts-ignore
        const boxGeometry = new THREE.BoxGeometry(
            boxSize, 
            boxSize, 
            boxSize
        );
        // @ts-ignore
        const material = new THREE.MeshBasicMaterial({
             color: color,
             map: this.loadingTexture,
             transparent: true,             
             opacity: this.collisionsDebugEnabled ? 0.5 : 0
        });     

        // @ts-ignore
        const box = new THREE.Mesh(boxGeometry, material);
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

        modelLoader.load(
          modelPath,
          // @ts-ignore
          function (container) {
            const model = container.scene;
            
            const oldX = box.position.x;
            const oldY = box.position.y;
            const oldZ = box.position.z;

            const oldRX = box.rotation.x;
            const oldRY = box.rotation.y;
            const oldRZ = box.rotation.z;
            
            box.position.x = 0;
            box.position.y = 0;
            box.position.z = 0;

            box.rotation.x = 0;
            box.rotation.y = 0;
            box.rotation.z = 0;

            box.attach(model);

            box.position.x = oldX;
            box.position.y = oldY;
            box.position.z = oldZ;

            box.rotation.x = oldRX;
            box.rotation.y = oldRY;
            box.rotation.z = oldRZ;

            const animationMixer = new THREE.AnimationMixer(model);
            // @ts-ignore
            container.animations.forEach((clip) => {
                animationMixer.clipAction(clip).play();
            });
            sceneController.animationMixers.push(animationMixer);

            // @ts-ignore
            model.traverse((entity) => {
                if (entity.isMesh) {
                    const mesh = entity;
                    sceneObject.meshes.push(mesh)
                }
            })
            
            debugPrint(`Model load success: ${modelPath}`)
            successCallback();
          }
        );
    }

    public addBoxAt(
        name: string,
        x: number,
        y: number,
        z: number,
        textureName: string = "com.demensdeum.failback",    
        size: number = 1.0,            
        color: number = 0x00FFFF,
        opacity: number = 1.0
    ): void {
        debugPrint("addBoxAt: " + x + " " + y + " " + z);
        const texturePath = Paths.texturePath(textureName);
        // @ts-ignore
        const boxGeometry = new THREE.BoxGeometry(
            size, 
            size, 
            size
        );
        // @ts-ignore
        const material = new THREE.MeshBasicMaterial({
             color: color,
             map: this.loadingTexture,
             transparent: true,             
             opacity: opacity
        });

        const newMaterial = new THREE.MeshBasicMaterial({
            color: color,
            map: this.textureLoader.load(
                texturePath,
                // @ts-ignore
                (texture)=>{
                    material.map = texture;
                    material.needsUpdate;
                },
                // @ts-ignore
                (error)=>{
                    console.log("WUT!!!!");
                }
            ),
            transparent: true,
            opacity: opacity
       });        
       this.texturesToLoad.push(newMaterial);        

        // @ts-ignore
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
        // @ts-ignore
        const planeGeometry = new THREE.PlaneGeometry(width, height);

        // @ts-ignore
        const material = new THREE.MeshBasicMaterial({
            color: color,
            map: this.loadingTexture,
            // @ts-ignore
            depthWrite: !resetDepthBuffer,
            // @ts-ignore
            side: THREE.DoubleSide,
            transparent: transparent
        });

        // @ts-ignore
        const newMaterial = new THREE.MeshBasicMaterial({
            color: color,
            map: this.textureLoader.load(
                texturePath,
                // @ts-ignore
                (texture)=>{
                    material.map = texture;
                    material.needsUpdate = true;
                },
                // @ts-ignore
                (error)=>{
                    console.log("WUT!");
                }),
                // @ts-ignore
            depthWrite: !resetDepthBuffer,
            // @ts-ignore
            side: THREE.DoubleSide,
            transparent: transparent
        });
        newMaterial.map.encoding = THREE.sRGBEncoding;
        this.texturesToLoad.push(newMaterial);        

        // @ts-ignore
        const plane = new THREE.Mesh(planeGeometry, material);
        plane.position.x = x;
        plane.position.y = y;
        plane.position.z = z;
        if (resetDepthBuffer) {
            plane.renderOrder = -1;
        }

        // @ts-ignore
        const box = new THREE.Box3().setFromObject(plane);

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
        controller: ObjectsPickerController,
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
        // @ts-ignore
        const alisaColliderBox = new THREE.Box3().setFromObject(alisa.threeObject);
        // @ts-ignore
        const bobCollider = new THREE.Box3().setFromObject(bob.threeObject);
        const output = alisaColliderBox.intersectsBox(bobCollider);
        //this.context.debugPrint("alisa object:" + alisa.name + "; bob: "+ bob.name +"; collide result: " + output);
        return output;
    }

    private sceneObject(
        name: string,
        x: number = 0,
        y: number = 0,
        z: number = 0
    ): SceneObject
    {
        const sceneController = this;
        // @ts-ignore
        var object = this.objects[name];
        if (!object || object == undefined) {
            debugPrint("Can't find object with name: {"+ name +"}!!!!!");
            if (name == Names.Skybox) {
                debugPrint("But it's skybox so don't mind!")
            }
            else {
                debugger;
                debugPrint("Adding dummy box with name: " + name);
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
        controls: Controls,
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