import { Container, Graphics, TextStyle, Text} from 'pixi.js';
import { PLAYING_AREA_ENUMS, STAGE_SETTINGS_ENUMS } from '../enums'
interface graphicObjects {
    idleContainer: Container,
    playingArea: Container,
    movingContainer: Container
    scoreContainer: Container
}
interface pointRect {
    width: number,
    height: number
}
export default class extends Container {
    private shared: any
    public graphicObjects: graphicObjects
    private rectSize: pointRect;
    constructor(shared: any) {
        super();
        this.shared = shared;
        this.rectSize = this.initPointRectSize();
        this.graphicObjects = {
            idleContainer: new Container(),
            playingArea: new Container(),
            movingContainer: new Container(),
            scoreContainer: new Container()
        }
        this.addChild(this.graphicObjects.playingArea)
        this.addChild(this.graphicObjects.movingContainer)
        this.addChild(this.graphicObjects.scoreContainer)
        this.addChild(this.graphicObjects.idleContainer)
        this.generateIdleContainer();
        this.generateScoreGraphics();
        this.x = PLAYING_AREA_ENUMS.X;
        this.y = PLAYING_AREA_ENUMS.Y;
    }

    private initPointRectSize(): pointRect{
        return {
            width: PLAYING_AREA_ENUMS.WIDTH/PLAYING_AREA_ENUMS.COLUMNS,
            height: PLAYING_AREA_ENUMS.HEIGHT/PLAYING_AREA_ENUMS.ROWS
        }
    }

    public validateMovingContainer(currentShape): void {
        for (var i = this.graphicObjects.movingContainer.children.length - 1; i >= 0; i--) {	this.graphicObjects.movingContainer.removeChild(this.graphicObjects.movingContainer.children[i]);};
        if(!currentShape) return;
        var currentRow = currentShape.current_row_minus_current_height;
        var currentColumn = currentShape.currentPos.column;
        currentShape.currentRect.forEach((RowArr, RowIndex) => {
            RowArr.forEach((haveBlock, ColumnIndex) => {
                if(haveBlock){
                    var rect = new Graphics();
                    rect.beginFill(currentShape.color, 1);
                    const calculatedX = this.rectSize.width*(ColumnIndex+currentColumn)
                    const calculatedY = this.rectSize.height*(RowIndex+currentRow)
                    rect.lineStyle(5, 0x000000);
                    rect.drawRect(calculatedX, calculatedY, this.rectSize.width, this.rectSize.height);
                    rect.endFill();
                    this.graphicObjects.movingContainer.addChild(rect)
                }
            });
        });
    }

    public validatePlayingArea(): void {
        for (var i = this.graphicObjects.playingArea.children.length - 1; i >= 0; i--) {	this.graphicObjects.playingArea.removeChild(this.graphicObjects.playingArea.children[i]);};
        this.shared.memory.playing_table.forEach((RowArr, RowIndex) => {
            RowArr.forEach((Color, ColumnIndex) => {
                var rect = new Graphics();
                if(Color) {
                    rect.beginFill(Color, 1);
                } else {
                    rect.beginFill(0xffffff, 0.3);
                }
                const calculatedX = this.rectSize.width*ColumnIndex
                const calculatedY = this.rectSize.height*RowIndex
                rect.lineStyle(5, 0x000000);
                rect.drawRect(calculatedX, calculatedY, this.rectSize.width, this.rectSize.height);
                rect.endFill();
                this.graphicObjects.playingArea.addChild(rect)
            });
        });
    }

    private generateScoreGraphics(): void {
        this.graphicObjects.scoreContainer.x = 700
        var rect = new Graphics();
        rect.beginFill(0x000000, 0.3);
        rect.drawRect(0, 0, 500, 130);
        rect.endFill();
        const style = new TextStyle({
            fill: "white",
            fontSize: 80,
            strokeThickness: 5
        });
        var text = new Text('0', style);
        text.anchor.set(0.5)
        text.y = 50;
        text.x = 180
        text.name = 'score'
        this.graphicObjects.scoreContainer.addChild(rect);
        this.graphicObjects.scoreContainer.addChild(text);
    }

    private generateIdleContainer(): void{

        // generate background rectangle start
        var background = new Graphics();
        background.beginFill(0x00000, 0.3);
        background.drawRect(0, 0, STAGE_SETTINGS_ENUMS.WIDTH, STAGE_SETTINGS_ENUMS.HEIGHT);
        background.endFill();
        // generate background rectangle stop


        // generate rectangle for play text background start
        var rectForPlay = new Graphics();
        rectForPlay.beginFill(0xffff, 0.6);
        rectForPlay.drawRect(300, 900, 500, 130);
        rectForPlay.endFill();
        // generate rectangle for play text background start



        // generate text play start
        const textPlayStyle = new TextStyle({fill: "white",fontSize: 80,strokeThickness: 5});
        var textPlay = new Text('PLAY', textPlayStyle);
        textPlay.x = 450;
        textPlay.y = 920;
        // generate text play stop


        // generate text best score start
        const bestScoreStyle = new TextStyle({fill: "#ffffff", fontSize: 60});
        var textBestScore = new Text('BEST SCORE: 0', bestScoreStyle);
        textBestScore.x = 300;
        textBestScore.y = 1120;
        textBestScore.name = 'best-score'
        // generate best score stop


        // generate buttonContainer and adding rect with text start
        var buttonContainer = new Container();
        buttonContainer.addChild(rectForPlay);
        buttonContainer.addChild(textPlay);
        buttonContainer.buttonMode = true;
        buttonContainer.interactive = true;
        const whenPressedFunc = ()=> {
            this.graphicObjects.idleContainer.visible = false;
            this.shared.GameManager.startPlay();
        }
        buttonContainer.on('click', whenPressedFunc)
        // generate buttonContainer and adding rect with text stop

        // add containers at idleContainer start
        this.graphicObjects.idleContainer.addChild(background);
        this.graphicObjects.idleContainer.addChild(buttonContainer)
        this.graphicObjects.idleContainer.addChild(textBestScore)
        // add containers at idleContainer stop
    }



    public updateScore(newScore: number): void {
        var textDisplayObject: any = this.graphicObjects.scoreContainer.getChildByName('score')
        textDisplayObject.text = newScore
    }


    public updateBestScore(newScore: string): void {
        var textDisplayObject: any = this.graphicObjects.idleContainer.getChildByName('best-score')
        textDisplayObject.text = 'BEST SCORE: '+newScore
    }
}