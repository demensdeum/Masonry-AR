export class Utils {
    public static angleToRadians(angle: number) {
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
}