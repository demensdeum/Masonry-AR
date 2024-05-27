import { Constants } from "./constants.js";
import { GameInitializationControllerDelegate } from "./gameInitializationControllerDelegate.js";

export class GameInitializationController {
    private delegate: GameInitializationControllerDelegate;

    constructor(delegate: GameInitializationControllerDelegate) {
        this.delegate = delegate;
    }

    public async initialize() {
        try {
            await this.handleHeroForUserResponse(true);
        } catch (error) {
            this.delegate.gameInitializationControllerDidReceiveError(this, `${error}`);
        }
    }

    private async handleHeroForUserResponse(shouldCreateHero: boolean) {
        const heroResponse = await this.fetchHeroForUser();
        if (heroResponse.code === 0 && heroResponse.hero) {
            this.delegate.gameInitializationControllerDidAuthorize(this, heroResponse.hero);
        } else if (heroResponse.code === 1 && shouldCreateHero) {
            const createHeroResponse = await this.createHero();
            if (createHeroResponse.code === 0) {
                await this.handleHeroForUserResponse(false);
            } else {
                throw new Error('Failed to create hero');
            }
        } else {
            throw new Error('Unexpected response code or hero not found');
        }
    }

    private async fetchHeroForUser() {
        const response = await fetch(`${Constants.apiPath}/server/heroForUser.php`);
        if (!response.ok) {
            throw new Error('Failed to fetch heroForUser');
        }
        return response.json();
    }

    private async createHero() {
        const response = await fetch(`${Constants.apiPath}/server/createHero.php`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to create hero');
        }
        return response.json();
    }
}
