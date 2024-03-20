import { GeolocationControllerDelegate } from "./geolocationControllerDelegate.js";
import { GeolocationControllerInterface } from "./geolocationControllerInterface.js";
import { GameGeolocationPosition } from "./geolocationPosition.js";

export class MockGeolocationController implements GeolocationControllerInterface {

    public delegate: GeolocationControllerDelegate

    private position = new GameGeolocationPosition(51.509865, -0.118092)

    constructor(
        delegate: GeolocationControllerDelegate
    )
    {
        this.delegate = delegate
    }

    askPermission(): void {
        this.delegate.geolocationControllerGeolocationAccessGranted(
            this,
            this.position
        )
    }

    trackPosition(): void {
        this.delegate.geolocationControllerDidGetPosition(
            this,
            this.position
        )
    }

}