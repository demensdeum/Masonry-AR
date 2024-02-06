import { Euler } from "./euler.js";
import { SceneObjectCommandTranslate } from "./sceneObjectCommandTranslate.js";
import { SceneObjectCommandRotate } from "./sceneObjectCommandRotate.js";
import { SceneObjectCommandJump } from "./sceneObjectCommandJump.js";
import { SceneObjectCommandTeleport } from "./sceneObjectCommandTeleport.js";
import { SceneObjectCommand } from "./sceneObjectCommand.js";
import { Controls } from "./controls";
import { ControlsDelegate } from "./controlsDelegate";
import { ControlsDataSource } from "./playerControlsDataSource.js";

export class SceneObjectCommandPerformer implements Controls {
    public delegate: ControlsDelegate;
    public dataSource: ControlsDataSource;
    public objectName: string;

    constructor(
        objectName: string,
        delegate: ControlsDelegate,
        dataSource: ControlsDataSource
    ) {
        this.objectName = objectName;
        this.delegate = delegate;
        this.dataSource = dataSource
    }

    handleCommand(command: SceneObjectCommand) {
        if (command instanceof SceneObjectCommandTranslate) {
            this.performTranslate(command);
        }
        else if (command instanceof SceneObjectCommandRotate) {
            this.performRotate(command);
        }
        else if (command instanceof SceneObjectCommandJump) {
            this.performJump(command);
        }
        else if (command instanceof SceneObjectCommandTeleport) {
            this.performTeleport(command);
        }
        command.step();   
    }

    private performTranslate(command: SceneObjectCommandTranslate) {
        // @ts-ignore
        const x = command.translate.x;
        // @ts-ignore
        const y = command.translate.y;
        // @ts-ignore
        const z = command.translate.z;
        this.delegate.controlsRequireObjectTranslate(
            this,
            this.objectName,
            x,
            y, 
            z
        );        
    }

    private performRotate(command: SceneObjectCommandRotate) {
        // @ts-ignore
        const x = command.rotate.x;
        // @ts-ignore
        const y = command.rotate.y;
        // @ts-ignore
        const z = command.rotate.z;

        const euler = new Euler(0, 0, 0, 'YXZ' );        
        const quaternion = this.dataSource.controlsQuaternionForObject(
            this,
            this.objectName
        );

        // @ts-ignore
		euler.setFromQuaternion(quaternion);

        euler.x += x;
		euler.y += y;
        euler.z += z;

        this.delegate.controlsRequireObjectRotation(
            this,
            this.objectName,
            euler
        ); 
    }

    private performJump(command: SceneObjectCommandJump) {
        this.delegate.controlsRequireJump(this, this.objectName);
    }

    private performTeleport(command: SceneObjectCommandTeleport) {
        // @ts-ignore
        const x = command.position.x;
        // @ts-ignore
        const y = command.position.y;
        // @ts-ignore
        const z = command.position.z;
        
        this.delegate.controlsRequireObjectTeleport(this, this.objectName, x, y, z);
    }
    
    public step(delta: any): void {
    }    
}