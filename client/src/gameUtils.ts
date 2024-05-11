export class GameUtils {
    static gotoWiki(args: {locale: string}) {
        const url = args.locale == "ru" ? "https://demensdeum.com/masonry-ar-wiki-ru/" : "https://demensdeum.com/masonry-ar-wiki-en/"
        window.location.assign(url)        
    }
}