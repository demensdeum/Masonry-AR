import { GameGeolocationPosition } from "./gameGeolocationPosition.js"
import { debugPrint } from "./runtime.js"
import { float } from "./types.js"

export class Utils {
    public static showHtmlElement(
        args: {
            name: string
        }
    ) {
        if ((document.getElementsByClassName(args.name)[0] as HTMLElement).style.display != "block") {
            (document.getElementsByClassName(args.name)[0] as HTMLElement).style.display = "block"
        }
    }

    public static hideHtmlElement(
        args: {
            name: string
        }
    ) {
        if ((document.getElementsByClassName(args.name)[0] as HTMLElement).style.display != "none") {
            (document.getElementsByClassName(args.name)[0] as HTMLElement).style.display = "none"
        }
    }

    public static showHtmlFlexElement(
        args: {
            name: string
        }
    ) {
        if ((document.getElementsByClassName(args.name)[0] as HTMLElement).style.display != "flex") {
            (document.getElementsByClassName(args.name)[0] as HTMLElement).style.display = "flex"
        }
    }

    public static moveCssLayerFront() {
        const cssCanvas = document.querySelector("#css-canvas")
        if (cssCanvas instanceof HTMLElement) {
            cssCanvas.style.zIndex = "1"
        }
        else {
            debugPrint("moveCssLayerFront => Error! No cssCanvas")
            debugger
        }
        const canvas = document.getElementsByClassName("webgl")[0]
        if (canvas instanceof HTMLElement) {
            canvas.style.zIndex = "0"
        }
        else {
            debugPrint("moveCssLayerFront => Error! No canvas")
            debugger
        }
    }

    public static moveCssLayerBack() {
        const cssCanvas = document.querySelector("#css-canvas")
        if (cssCanvas instanceof HTMLElement) {
            cssCanvas.style.zIndex = "0"
        }
        const canvas = document.getElementsByClassName("canvas")
        if (canvas instanceof HTMLElement) {
            canvas.style.zIndex = "1"
        }
    }

    public static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

    public static degreesToRadians(angle: number) {
        return angle * Math.PI / 180;
    }

    public static randomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    public static randomFloat(max: number) {
        return Math.random() * max;
    }

    public static randomBool() {
        const random = Utils.randomInt(100)
        const randomBool = random < 50  
        return randomBool;
    }

    public static radiansToAngle(radians: number) {
        return radians * 180 / 3.14;
    }

    public static shuffle<T>(array: T[]): T[] {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    public static isOperable(value: any) {
        if (value == null) {
            return false
        }
        else if (value == undefined) {
            return false
        }
        return true
    }

    public static isNumber(value: any) {
        if (this.isOperable(value) == false) {
            return false
        }
        else {
            return isNaN(value) == false
        }
    }

    public static numberOrConstant(
        value: any,
        constant: number
    ) {
        return this.isNumber(value) ? value : constant
    }

    public static timestamp()
    {
        return new Date().getTime()
    }

    public static getCookieValue(cookieName: string) {
        var name = cookieName + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var cookieArray = decodedCookie.split(';');
    
        for(var i = 0; i < cookieArray.length; i++) {
            var cookie = cookieArray[i].trim();
            if (cookie.indexOf(name) == 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
    
        return null;
    }   

    public static distanceBetweenPositions(positionA: GameGeolocationPosition, positionB: GameGeolocationPosition): float {
        const earthRadius = 6371000
        const lat1 = positionA.latitude
        const lon1 = positionA.longitude
        const lat2 = positionB.latitude
        const lon2 = positionB.longitude

        const dLat = this.degreesToRadians(lat2 - lat1)
        const dLon = this.degreesToRadians(lon2 - lon1)

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        const distance = earthRadius * c
        return Math.round(distance)
    }    
}