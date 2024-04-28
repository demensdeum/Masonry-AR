import { localizedStrings } from "./localizedStrings.js"

export class Translator {

    public locale: string = "en"

    private readonly dictionary = localizedStrings

    public translatedStringForKey(key: string): string {
        if (!(this.locale in this.dictionary)) {
            return `No locale: ${this.locale} - key: ${key}`
        }
        if (!(key in this.dictionary[this.locale])) {
            return `No key: ${key} - locale: ${this.locale}`
        }
        const output = this.dictionary[this.locale][key]
        return output
    }
}
