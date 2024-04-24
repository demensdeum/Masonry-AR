import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { Entity } from "./entity.js"

export class MiniMapController {

    private isEnabled: boolean = false
    // @ts-ignore
    private mapElementName: string
    // @ts-ignore
    private map?: any
    private entitiesPlacemarks: any[] = []

    constructor(
        mapElementName: string
    )
    {
        this.mapElementName = mapElementName

        // @ts-ignore
        document.global_miniMapController = this
    }

    public initialize() {
        if (this.isEnabled == false) {
            return
        }
        // @ts-ignore
        if (!document.global_yandexMapsInitialized) {
            const self = this
            // @ts-ignore
            ymaps.ready(()=>{
                setTimeout(self.initializeYadMap, 100)
                // @ts-ignore
                //self.initializeYadMap()
            })
        }
        else {
            setTimeout(this.initializeYadMap, 100)
            //this.initializeYadMap()
        }
    }    
    
    private initializeYadMap() {
        if (this.isEnabled == false) {
            return
        }
        //debugger
        // @ts-ignore
        document.global_miniMapController.map = new ymaps.Map(document.global_miniMapController.mapElementName, {
            center: [55.76, 37.64],
            zoom: 9
        });
        //(document.getElementsByClassName(this.mapElementName)[0] as HTMLElement).style.display = "block"
    }

    public setPlayerLocationAndCenter(
        location: GameGeolocationPosition
    ) {
        if (this.isEnabled == false) {
            return
        }

        this.map.setCenter([location.latitude, location.longitude], 18)
    }

    public showEntities(
        entities: Entity[]
    )
    {
        if (this.isEnabled == false) {
            return
        }

        const self = this
        this.entitiesPlacemarks.forEach(e => {
          self.map.geoObjects.remove(e)
        })

        entities.forEach(e => {
            // @ts-ignore
            const entityPlacemark = new ymaps.Placemark(
                [
                e.position.latitude,
                e.position.longitude
            ], {
                hintContent: "Что-то на игровой карте"
            })               
            self.entitiesPlacemarks.push(entityPlacemark)
            self.map.geoObjects.add(entityPlacemark)
        })
    }

}