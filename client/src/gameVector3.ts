import { float } from "./types.js"

export class GameVector3 {
    public x: float
    public y: float
    public z: float

    constructor(
        x: float,
        y: float,
        z: float
    )
    {
        this.x = x
        this.y = y
        this.z = z
    }

    public moveVector(
        toPosition: GameVector3,
        speed: float
    ) {
        const directionVector = toPosition.subtract(this)
        const normalizedDirection = directionVector.normalize()
        const step = normalizedDirection.multiply(speed)
        const distanceToTarget = this.distanceTo(toPosition)
        if (distanceToTarget <= step.length()) {
            return toPosition
        }        
        const newPosition = this.add(step)
        return newPosition        
    }

    public add(otherVector: GameVector3) {
        return new GameVector3(
            this.x + otherVector.x,
            this.y + otherVector.y,
            this.z + otherVector.z
        )
    }

    public subtract(otherVector: GameVector3) {
        return new GameVector3(
            this.x - otherVector.x,
            this.y - otherVector.y,
            this.z - otherVector.z
        )
    } 
    
    public multiply(scalar: float) {
        return new GameVector3(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        )
    }

    public distanceTo(otherVector: GameVector3) {
        const dx = otherVector.x - this.x;
        const dy = otherVector.y - this.y;
        const dz = otherVector.z - this.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }   

    public length() {
        return Math.sqrt(
            this.x * this.x + 
            this.y * this.y + 
            this.z * this.z
        )
    }    

    public normalize() {
        const length = Math.sqrt(
            this.x * 
            this.x + 
            this.y * 
            this.y + 
            this.z * 
            this.z
        )
        if (length === 0) {
            return new GameVector3(
                0,
                0,
                0
            );
        }
        return new GameVector3(
            this.x / length,
            this.y / length,
            this.z / length
        );
    }    

    public clone(): GameVector3 {
        return new GameVector3(
            this.x,
            this.y,
            this.z
        )
    }

    public printable(): string {
        return `x: ${this.x} | y: ${this.y} | z: ${this.z}`
    }
}