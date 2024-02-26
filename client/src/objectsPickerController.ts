import * as THREE from "three"
import { debugPrint, raiseCriticalError } from "./runtime.js"
import { SceneObject } from "./sceneObject.js"
import { ObjectsPickerControllerDelegate } from "./objectsPickerControllerDelegate.js"

export class ObjectsPickerController {

    private renderer: any
    private camera: THREE.Camera
    private raycaster = new THREE.Raycaster()
    private sceneObjects: SceneObject[] = [];
    private delegate: ObjectsPickerControllerDelegate

    constructor(
        renderer: any,
        camera: THREE.Camera,
        delegate: ObjectsPickerControllerDelegate    
    ) {
        this.renderer = renderer
        this.camera = camera
        this.delegate = delegate
        const self = this
        document.addEventListener("mousedown", (event) => {
            self.pick(event)
        })
    }

    addSceneObject(sceneObject: SceneObject) {
        this.sceneObjects.push(sceneObject);
        debugPrint(`objectsPickerController addSceneObject: ${sceneObject.name}`)
    }

    public removeSceneObject(sceneObject: SceneObject) {
        const index = this.sceneObjects.findIndex(a => a == sceneObject)
        if (index == -1) {
            raiseCriticalError("Can't find object to remove in sceneObjects!!!")
            return
        }
        delete this.sceneObjects[index]
    }

    public pick(event: MouseEvent) {
        const mouse = new THREE.Vector2()
        mouse.set(
            (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1,
            -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1
        )
        this.raycaster.setFromCamera(
            mouse,
            this.camera
        )

        this.sceneObjects.forEach((object) => {
            const collisions = this.raycaster.intersectObjects(
                object.meshes,
                false
            )                
            if (collisions.length > 0) {  
                debugPrint(`collision: ${object.name}`)
                this.delegate.objectsPickerControllerDidPickObject(this, object)
            }
            else {
                debugPrint(`no collision: ${object.name}; meshes count: ${object.meshes.length}`)
            }
        })
    }
}