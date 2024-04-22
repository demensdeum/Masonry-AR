import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { Entity } from "./entity.js"

export class MiniMapController {

    private mapElementName: string
    // @ts-ignore
    private map?: any
    private entitiesPlacemarks: any[] = []

    constructor(
        mapElementName: string
    )
    {
        this.mapElementName = mapElementName
    }

    public initialize() {
        return
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
        return
        // @ts-ignore
        this.map = new ymaps.Map(this.mapElementName, {
            center: [55.76, 37.64],
            zoom: 9
        });
        this.map.options.restrictMapArea = true;
        (document.getElementsByClassName(this.mapElementName)[0] as HTMLElement).style.display = "block"
    }

    public setPlayerLocationAndCenter(
        location: GameGeolocationPosition
    ) {
        return
        this.map.setCenter([location.latitude, location.longitude], 18)
    }

    public showEntities(
        entities: Entity[]
    )
    {
        return
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