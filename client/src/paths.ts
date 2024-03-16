export class Paths {
    static readonly assetsDirectory: string = "assets";    
    
    static readonly textureExtension: string = "jpg";
    static readonly modelExtension: string = "glb";    
    static readonly skyboxEnvironmentExtension: string = "hdr"; 

    static readonly modelSuffix: string = ".model.";
    static readonly textureSuffix: string = ".texture.";
    static readonly skyboxEnvironmentSuffix: string = ".skybox.environment.";

    static modelPath(name: string): string {
        return "./" + this.assetsDirectory + "/" + name + this.modelSuffix + this.modelExtension;
    }

    static texturePath(name: string): string {
        return "./" + this.assetsDirectory + "/" + name + this.textureSuffix + this.textureExtension;
    }

    static environmentPath(name: string): string {
        return name + this.skyboxEnvironmentSuffix + this.skyboxEnvironmentExtension;
    }

    static skyboxFrontTexturePath(name: string): string {
        return name + ".skybox.front"       
    }

    static skyboxBackTexturePath(name: string): string {
        return name + ".skybox.back"
    }

    static skyboxTopTexturePath(name: string): string {
        return name + ".skybox.top"     
    }

    static skyboxBottomTexturePath(name: string): string {
        return name + ".skybox.bottom"
    }

    static skyboxLeftTexturePath(name: string): string {
        return name + ".skybox.left"     
    }

    static skyboxRightTexturePath(name: string): string {
        return name + ".skybox.right"
    }
}