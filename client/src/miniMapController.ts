import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { Entity } from "./entity.js"

export class MiniMapController {
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
    }

    public initialize() {
        // @ts-ignore
        if (!document.global_yandexMapsInitialized) {
            const self = this
            // @ts-ignore
            ymaps.ready(()=>{
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
            zoom: 9,
            controls: []
        },
        {suppressMapOpenBlock: true});
    }

    public setPlayerLocationAndCenter(
        location: GameGeolocationPosition
    ) {
        this.map.setCenter([location.latitude, location.longitude], 18)
    }

    public showEntities(
        entities: Entity[]
    )
    {
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