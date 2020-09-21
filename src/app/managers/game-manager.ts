import { PLAYING_AREA_ENUMS, GENERAL_GAMEPLAY } from '../enums'
import shapes from '../shapes.json';
import MovingShape from '../classes/moving-shape'
import SceneContainer from '../classes/scene-container'

export class GameManager {
    private shared: any;
    private sceneContainer: SceneContainer;
    private currentShape: MovingShape
    private currentPoints: number
    private clockInterval: any
    constructor(shared: any, sceneContainer: SceneContainer) {
        this.shared = shared
        this.sceneContainer = sceneContainer;
        this.currentShape = null
        this.currentPoints = 0
        this.clockInterval = null
        if(!localStorage.getItem('ryuzeke_tetris_best_score')) {
            localStorage.setItem('ryuzeke_tetris_best_score', "0")
        }
        this.sceneContainer.updateBestScore(localStorage.getItem('ryuzeke_tetris_best_score'))
        this.init();
    }

    private init():void{
        this.generatePlayingTable();
        this.sceneContainer.validatePlayingArea()
        document.addEventListener('keyup', (event) => {
            if(!this.currentShape)
                return;
            if(event.key === 'ArrowUp'){
                if(this.currentShape.rotate()){
                    this.sceneContainer.validateMovingContainer(this.currentShape);
                };
            }
            if(event.key === 'ArrowDown'){
                this.update();
            }
            if(event.key === 'ArrowLeft'){
                if(this.currentShape.moveLeft()){
                    this.sceneContainer.validateMovingContainer(this.currentShape);
                };
            }
            if(event.key === 'ArrowRight'){
                if(this.currentShape.moveRight()){
                    this.sceneContainer.validateMovingContainer(this.currentShape);
                };
            }
        })
    }

    public startPlay():void{
        this.currentPoints = 0;
        this.sceneContainer.updateScore(this.currentPoints)
        this.generatePlayingTable();
        this.sceneContainer.validatePlayingArea()
        this.generateShape();
        this.clockInterval = setInterval(()=>{
            this.update();
        }, GENERAL_GAMEPLAY.DROP_ROW_MS)
    }

    public stopPlay():void{
        clearInterval(this.clockInterval)
        this.currentShape = null
        this.sceneContainer.graphicObjects.idleContainer.visible = true;
        if (Number(localStorage.getItem('ryuzeke_tetris_best_score')) < this.currentPoints){
            localStorage.setItem('ryuzeke_tetris_best_score', String(this.currentPoints))
            this.sceneContainer.updateBestScore(localStorage.getItem('ryuzeke_tetris_best_score'))
        }
    }

    countOccurrences(arr:Array<String>, val): number {
        return arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
    }

    async update(): Promise<void> {
        if(!this.currentShape) return;
        if(this.currentShape.goToNextRow()){
            this.sceneContainer.validateMovingContainer(this.currentShape);
        } else {
            if(this.currentShape.current_row_minus_current_height < 0){
                this.stopPlay()
                return;
            }
            this.putCurrentShapeIntoPlayingTable();
            this.sceneContainer.validatePlayingArea();
            this.currentShape = null;
            this.sceneContainer.validateMovingContainer(this.currentShape)
            await this.checkAndDeleteFullRows();
            this.generateShape();
        }
    }

    async checkAndDeleteFullRows(): Promise<void> {
        for(let i=0; i<this.shared.memory.playing_table.length; i++){
            let row = this.shared.memory.playing_table[i]
            if(this.countOccurrences(row, null) == 0){ // if row dont have null value it wins and i destroy it
                await this.destroyRow(i);
                this.addPoints(GENERAL_GAMEPLAY.POINTS_PER_LINE);
            }
        }
    }

    addPoints(points2Add: number): void {
        this.currentPoints += points2Add;
        this.sceneContainer.updateScore(this.currentPoints)
    }

    putCurrentShapeIntoPlayingTable(): void{
        var shapeColumn = this.currentShape.currentPos.column
        var shapeRow = this.currentShape.current_row_minus_current_height
        for(let i=0; i<this.currentShape.currentRect.length; i++){
            let row = this.currentShape.currentRect[i]
            for(let v=0; v<row.length; v++){
                let haveBlock = row[v]
                if(haveBlock && shapeRow+i >= 0){
                    this.shared.memory.playing_table[shapeRow+i][shapeColumn+v] = this.currentShape.color
                }
            }
        }
    }

    destroyRow(row: number){
        return new Promise((resolve, reject) => {
            var nullRow = new Array(PLAYING_AREA_ENUMS.COLUMNS).fill(null);
            this.shared.memory.playing_table[row] = nullRow
            this.sceneContainer.validatePlayingArea();
            this.shared.memory.playing_table[0] = nullRow
            for(var i=row; i>0; i--){
                this.shared.memory.playing_table[i] = this.shared.memory.playing_table[i-1]
            }
            setTimeout(() => {
                this.sceneContainer.validatePlayingArea();
                resolve(true)
            }, 500);
        })
    }

    generateShape(): void {
        const randomElement = shapes[Math.floor(Math.random() * shapes.length)];
        this.currentShape = new MovingShape(randomElement, this.shared)
    }



    generatePlayingTable(): void{
        this.shared.memory.playing_table = []
        for(var y=0; y<PLAYING_AREA_ENUMS.ROWS; y++){
            this.shared.memory.playing_table[y] = []
            for(var x=0; x<PLAYING_AREA_ENUMS.COLUMNS; x++){
                this.shared.memory.playing_table[y][x] = null;
            }
        }
    }
}
