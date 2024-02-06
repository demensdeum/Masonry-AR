import { WeatherController } from "./weatherController.js";

export interface WeatherControllerDelegate {
    weatherControllerDidRequireToAddInstancedMeshToScene(
        weatherController: WeatherController,
        instancedMesh: any
    ): void;
}