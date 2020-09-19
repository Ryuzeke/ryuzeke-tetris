import { Application, Container } from 'pixi.js';
import { STAGE_SETTINGS_ENUMS } from '../enums'

export class StageManager {
    private app: Application;
    constructor(parent: HTMLElement, shared: object) {
        this.app = new Application({width: STAGE_SETTINGS_ENUMS.WIDTH, height: STAGE_SETTINGS_ENUMS.HEIGHT, backgroundColor : 0x000000, transparent: true});
        parent.replaceChild(this.app.view, parent.lastElementChild);
        this.resize();
        window.addEventListener("resize", this.resize.bind(this));
    }

    private resize(): void {
        var ratio = Math.min(window.innerWidth/STAGE_SETTINGS_ENUMS.WIDTH,window.innerHeight/STAGE_SETTINGS_ENUMS.HEIGHT);
        this.stage.scale.x = this.stage.scale.y = ratio;
        this.app.renderer.resize(Math.ceil(STAGE_SETTINGS_ENUMS.WIDTH * ratio),Math.ceil(STAGE_SETTINGS_ENUMS.HEIGHT * ratio));
    }

    public get stage(): Container {
        return this.app.stage;
    }
}
