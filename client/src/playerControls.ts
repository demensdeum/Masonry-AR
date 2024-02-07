// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { ControlsDataSource } from "./playerControlsDataSource.js";
import { ControlsDelegate } from "./controlsDelegate.js"
import { debugPrint } from "./runtime.js";
import { Euler } from "./euler.js";

//ThreeJS

export class PlayerControls implements Controls {
	private spaceButtonPressed: boolean = false;
    private forwardButtonPressed: boolean = false;
    private backwardButtonPressed: boolean = false;
    private leftButtonPressed: boolean = false;
    private rightButtonPressed: boolean = false;
    private readonly moveDiff = 0.01;
    private objectName: string;
    dataSource: ControlsDataSource;
    delegate: ControlsDelegate;
    private isFocused: boolean = false;
    private targetElement?: HTMLElement;
    private pointerDiffX: float = 0;
    private pointerDiffY: float = 0;
    public mouseSensitivity: float;
    private verticalLock: boolean = false;

    constructor(
        objectName: string,
        targetElement: HTMLElement,
        mouseSensitivity: float,
        verticalLock: boolean,
        dataSource: ControlsDataSource,
        delegate: ControlsDelegate
    )
    {
        this.mouseSensitivity = mouseSensitivity;
        this.verticalLock = verticalLock;
        this.dataSource = dataSource;
        this.delegate = delegate;
          
        this.objectName = objectName;
        const controls = this;

        document.addEventListener("pointerlockchange", (_) => {
            controls.pointerLockChange();
        });
        
        document.addEventListener("mousemove", (event) => {
            controls.mouseMove(event)
        });

        document.addEventListener("keydown", event => {
            console.log("keydown");
            const key = event.keyCode;
            switch (key) {
				case 32:
					controls.spaceButtonPressed = true;
					this.delegate.controlsRequireJump(this, this.objectName);
					break;
                case 87:
                    controls.forwardButtonPressed = true;
                    break;
                case 83:
                    controls.backwardButtonPressed = true;
                    break;
                case 65:
                    controls.leftButtonPressed = true;
                    break;
                case 68:
                    controls.rightButtonPressed = true;
                    break;
            }
        });

        document.addEventListener("keyup", event => {
            console.log("keyup");
            const key = event.keyCode;
            switch (key) {
				case 32:
					controls.spaceButtonPressed = false;
					break;
                case 87:
                    controls.forwardButtonPressed = false;
                    break;
                case 83:
                    controls.backwardButtonPressed = false;
                    break;
                case 65:
                    controls.leftButtonPressed = false;
                    break;
                case 68:
                    controls.rightButtonPressed = false;
                    break;
            }
        });

        targetElement.addEventListener('click', () => {
            targetElement.requestPointerLock();
        });        
  };

    private mouseMove(event: MouseEvent) {
        if (this.isFocused == false) {
            return;
        }

		this.pointerDiffX = event.movementX || 0;
		this.pointerDiffY = event.movementY || 0;

        debugPrint("pointerDiffX: " + this.pointerDiffX + "; y: " + this.pointerDiffY);
    }

    private pointerLockChange() {
        this.isFocused = document.pointerLockElement != this.targetElement;
    }

    public step(delta: any) {
        const speed = 0.05;
        var x = 0;
        const y = 0;
        var z = 0;

        if (this.leftButtonPressed) {
			if (this.dataSource.controlsCanMoveLeftObject()) {
            	x = -speed;
			}
        }
        else if (this.rightButtonPressed) {
			if (this.dataSource.controlsCanMoveRightObject()) {
            	x = speed;
			}
        }

        if (this.forwardButtonPressed) {
			if (this.dataSource.controlsCanMoveForwardObject(this, this.objectName)) {
            	z = -speed;
			}
        }
        else if (this.backwardButtonPressed) {
			if (this.dataSource.controlsCanMoveBackwardObject(this, this.objectName)) {
            	z = speed;
			}
        }

        this.delegate.controlsRequireObjectTranslate(
            this,
            this.objectName,
            x,
            y,
            z
        );
        
        // @ts-ignore
        const euler = new Euler( 0, 0, 0, 'YXZ' );
        const PI_2 = Math.PI / 2;        
        const quaternion = this.dataSource.controlsQuaternionForObject(
            this,
            this.objectName
        );
		euler.setFromQuaternion(quaternion);

		euler.y -= this.pointerDiffX * 0.001 * this.mouseSensitivity;

        if (!this.verticalLock) {
            euler.x -= this.pointerDiffY * 0.001 * this.mouseSensitivity;
		    euler.x = Math.max( - PI_2, Math.min( PI_2, euler.x ) );
        }

        this.delegate.controlsRequireObjectRotation(
            this,
            this.objectName,
            euler
        );
        this.pointerDiffX = 0;
        this.pointerDiffY = 0;
    };
}