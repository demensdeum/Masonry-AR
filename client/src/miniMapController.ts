import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { Entity } from "./entity.js"

export class MiniMapController {
    private mapElementName: string
    private map?: any = null
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
                self.injectYadMap()
            })
        }
        else {
            this.injectYadMap()
        }
    }    
    
    private injectYadMap() {
        const handleMapAppearance = (mutationsList: any, observer: any) => {
            for (let mutation of mutationsList) {
                if (mutation.type != 'childList') {
                    continue
                }
                for (let node of mutation.addedNodes) {
                    if (node.id == this.mapElementName) {
                        this.initializeYadMap();
                        observer.disconnect();
                        return
                    }
                }
            }
        }

        const mapElement = document.getElementById("map");
        if (mapElement) {
            this.initializeYadMap()
        } else {
            const observer = new MutationObserver(handleMapAppearance);
            observer.observe(document.body, { childList: true, subtree: true });
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
        if (this.map == null) {
            return
        }
        this.map.setCenter([location.latitude, location.longitude], 16.5)
    }

    public showEntities(
        entities: Entity[]
    )
    {
        if (this.map == null) {
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