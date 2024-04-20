import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { debugPrint } from "./runtime.js"

export class MapController {

    private mapElementName: string
    // @ts-ignore
    private map?: any

    constructor(
        mapElementName: string
    )
    {
        this.mapElementName = mapElementName
    }

    public initialize() {
        // @ts-ignore
        if (!document.global_yandexMapsInitialized) {
            const self = this
            // @ts-ignore
            ymaps.ready(()=>{
                // @ts-ignore
                self.initializeYadMap()
            })
        }
        else {
            this.initializeYadMap()
        }
    }    
    
    private initializeYadMap() {
        // @ts-ignore
        this.map = new ymaps.Map(this.mapElementName, {
            center: [55.76, 37.64],
            zoom: 7
        });
        (document.getElementsByClassName(this.mapElementName)[0] as HTMLElement).style.display = "block"
    }

    public setPlayerLocationAndCenter(
        location: GameGeolocationPosition
    ) {
        debugPrint(location)
    }

}