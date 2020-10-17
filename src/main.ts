import { StageManager } from "./app/managers/stage-manager";
import { GameManager } from "./app/managers/game-manager";
import SceneContainer from './app/classes/scene-container'
import * as PIXI from 'pixi.js'

//i didn't put loader because i dont have any images/sound/files i want to load
var shared:any = {
    memory: {
        playing_table: []
    }
}
function init(){
    window.PIXI = PIXI; //debug reasons
    initStageManager()
    initSceneContainer()
    initGameManager()
}

function initStageManager(){
    const StageManagerInst = new StageManager(document.body, shared)
    shared.StageManager = StageManagerInst;
}

function initSceneContainer(){
    const SceneContainerInst = new SceneContainer(shared)
    shared.SceneContainer = SceneContainerInst;
    shared.StageManager.stage.addChild(SceneContainerInst)
}

function initGameManager(){
    const GameManagerInst = new GameManager(shared,shared.SceneContainer)
    shared.GameManager = GameManagerInst;
}



init();