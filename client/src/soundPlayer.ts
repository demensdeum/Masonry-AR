export class SoundPlayer {
    private audioPools: { [key: string]: HTMLAudioElement[] } = {};

    constructor(
        private volume: number = 1.0,
        private poolSize: number = 3
    ) {}

    private createAudioElement(audioPath: string): HTMLAudioElement {
        const audio = new Audio(audioPath);
        audio.volume = this.volume;
        audio.addEventListener('ended', () => {
            this.audioPools[audioPath].push(audio);
        });
        return audio;
    }

    add(audioPath: string): void {
        if (!this.audioPools[audioPath]) {
            this.audioPools[audioPath] = [];
            for (let i = 0; i < this.poolSize; i++) {
                const audio = this.createAudioElement(audioPath);
                this.audioPools[audioPath].push(audio);
            }
        }
    }

    setVolume(volume: number): void {
        this.volume = volume;
        Object.values(this.audioPools).forEach((audioPool) => {
            audioPool.forEach((audio) => {
                audio.volume = volume;
            });
        });
    }

    play(audioPath: string): void {
        const audioPool = this.audioPools[audioPath];
        if (!audioPool || audioPool.length === 0) {
            console.error(`No available pool for sound: ${audioPath}`);
            return;
        }

        const audio = audioPool.pop();
        if (audio) {
            audio.play();
        }
    }

    playAll(): void {
        Object.values(this.audioPools).forEach((audioPool) => {
            if (audioPool.length > 0) {
                const audio = audioPool.pop();
                if (audio) {
                    audio.play();
                }
            }
        });
    }

    stopAll(): void {
        Object.values(this.audioPools).forEach((audioPool) => {
            audioPool.forEach((audio) => {
                audio.pause();
                audio.currentTime = 0;
            });
        });
    }
}
