export class Translator {

    private locale: string = "ru"

    private readonly dictionary: { [key: string]: { [key: string]: string } } = {
        "en" : {
            "Score" : "Score",
            "Speed" : "Speed",
            "Message" : "Message",
            "Music cube!" : "Music cube!",
            "Speed boost!" : "Speed boost!",
            "Time" : "Time",
            "Game Started!" : "Game Started!"
        },
        "ru" : {
            "Score" : "Очки",
            "Speed" : "Скорость",
            "Message" : "Сообщение",
            "Music cube!" : "Музыкальный куб!",
            "Speed boost!" : "Ускорение!",
            "Time" : "Время",
            "Game Started!" : "Игра началась!"
        }
    };

    constructor(locale: string) {
        this.locale = locale;
    }

    public translatedStringForKey(key: string): string {
        const output = this.dictionary[this.locale][key];
        return output;
    }
}