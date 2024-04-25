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

        // @ts-ignore
        document.global_miniMapController = this
    }

    public initialize() {
        // @ts-ignore
        if (!document.global_yandexMapsInitialized) {
            const self = this
            // @ts-ignore
            ymaps.ready(()=>{
                setTimeout(self.initializeYadMap, 1000)
                // @ts-ignore
                //self.initializeYadMap()
            })
        }
        else {
            setTimeout(this.initializeYadMap, 1000)
            //this.initializeYadMap()
        }
    }    
    
    private initializeYadMap() {
        //debugger
        // @ts-ignore
        document.global_miniMapController.map = new ymaps.Map(document.global_miniMapController.mapElementName, {
            center: [55.76, 37.64],
            zoom: 9,
            controls: []
        },
        {suppressMapOpenBlock: true});
        //(document.getElementsByClassName(this.mapElementName)[0] as HTMLElement).style.display = "block"
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