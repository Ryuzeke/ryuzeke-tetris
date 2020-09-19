

interface pos {
    column: number,
    row: number,
    current_height: number
    current_width: number
    initial_height: number,
    initial_width: number,
}

interface spacesOfBox {
    spaces_from_top: number,
    spaces_from_bottom: number
}
import { PLAYING_AREA_ENUMS } from '../enums'
export default class {
    public config: any;
    public currentPos: pos;
    public currentRect: any;
    private current_rotation: number
    private shared: any;
    public rowToStop: number
    constructor(config: any, shared:any) {
        this.config = config;
        this.currentRect = config.rect
        this.currentPos = {
            row:-3, 
            column:config.initial_column,
            current_height: this.current_height,
            current_width: this.current_width,
            initial_height: this.current_height,
            initial_width: this.current_width
        }
        this.rowToStop = null;
        this.shared = shared;
        this.current_rotation = 0
        for(let i=0; i<config.initial_rotate; i++){
            this.rotate();
        }
        if(config.initial_column+this.current_width > PLAYING_AREA_ENUMS.COLUMNS){
            throw new Error("MOVING SHAPE> initial_column and shape width goes bigger than game columns");
        }
    }

    goToNextRow(): boolean{
        if(this.canGoDownFromRow(this.currentPos.row)){
            this.currentPos.row++
        } else {
            return false;
        }
        return true
    }

    get current_row_without_all_spaces(): number {
        return this.currentPos.row+this.current_empty_spaces.spaces_from_top-this.current_empty_spaces.spaces_from_bottom;
    }

    rotate(): boolean {
        const tempRect = this.currentRect;

        // found that on stackoverflow. hope someday i will reach that level of awesomeness thinking ^^
        this.currentRect = this.currentRect[0].map((val, index) => this.currentRect.map(row => row[index]).reverse())
        
        
        
        if(this.canGoDownFromRow(this.currentPos.row) && !this.isColumnOutOfBounds(this.currentPos.column) && this.canRotate()){
            if(this.current_rotation>=3){
                this.current_rotation = 0
            } else {
                this.current_rotation++
            }
            this.updateRotation();
            return true
        } else {
            this.currentRect = tempRect;
            return false
        }
    }


    moveLeft(): boolean {
        if(this.goLeftVerify()){
            this.currentPos.column--;
            console.log('my current column is ',this.currentPos.column);
            return true
        } else {
            return false;
        }
    }

    moveRight(): boolean {
        if(this.goRightVerify()){
            this.currentPos.column++;
            return true
        } else {
            return false;
        }
    }

    isColumnOutOfBounds(column: number): boolean {
        if(this.currentPos.row < 0){
            return true;
        }
        for(var i=0; i<this.currentRect.length; i++){
            let row = this.currentRect[i]
            for(var v=0; v<row.length; v++){
                var row_to_check = this.shared.memory.playing_table[i+this.current_row_minus_current_height];
                if(!row_to_check){
                    continue;
                }
                if(row_to_check[column+v] === undefined && this.currentRect[i][v] == 1){
                    return true;
                }
            }
        }
        return false
    }

    canRotate(): boolean {
        return PLAYING_AREA_ENUMS.COLUMNS > this.last_index_of_block+this.currentPos.column-1
    }

    updateRotation(): void {
        if(this.current_rotation % 2 == 0){
            this.currentPos.current_width = this.currentPos.initial_width
            this.currentPos.current_height = this.currentPos.initial_height
        } else {
            this.currentPos.current_height = this.currentPos.initial_width
            this.currentPos.current_width = this.currentPos.initial_height
        }
    }

    goLeftVerify(): boolean{
        if(this.isColumnOutOfBounds(this.currentPos.column-1)) return false;
        var gotNoRowToCheck = false
        for(var i=0; i<this.currentRect.length; i++){
            var row_to_check = this.shared.memory.playing_table[i+this.current_row_minus_current_height];
            if(!row_to_check){
                gotNoRowToCheck = true;
                continue;
            }
            if(this.currentRect[i][0] && row_to_check[this.currentPos.column-1]){
                return false;
            }
        }
        if(gotNoRowToCheck){
            return true
        }
        return true
    }

    goRightVerify(): boolean{
        if(this.isColumnOutOfBounds(this.currentPos.column+1)) return false;
        var gotNoRowToCheck = false
        for(var i=this.currentRect.length-1; i>=0; i--){
            var row_to_check = this.shared.memory.playing_table[(i+this.current_row_minus_current_height)];
            if(!row_to_check){
                gotNoRowToCheck = true;
                continue;
            }
            let freespaceOfRectColumns = this.currentRect[i].length-this.current_width;
            if(this.currentRect[i][this.currentRect[i].length-1-freespaceOfRectColumns] && row_to_check[this.currentPos.column+1]){
                return false;
            }
        }
        if(gotNoRowToCheck){
            return true
        }
        return true
    }



    canGoDownFromRow(row: number): boolean{
        var rowMinusHeight = row-this.current_height
        for(var i=0; i<this.currentRect.length-this.current_empty_spaces.spaces_from_bottom; i++){
            if(i+rowMinusHeight+this.current_empty_spaces.spaces_from_top < 0) continue;
            if(i+rowMinusHeight+1 < 0 && rowMinusHeight < this.currentRect.length){
                continue;
            }
            var row_to_check = this.shared.memory.playing_table[i+rowMinusHeight+1];
            if(!row_to_check){
                return false
            }
            if(!this.doTheyFit(this.currentRect[i], row_to_check)){
                return false
            }
        }
        return true
    }


    doTheyFit(rectArr: Array<Number>, playingAreaArr: Array<String>): boolean {
        var doTheyFit = true
        for(var i=rectArr.length-1; i>=0; i--){
            let value = rectArr[i];
            if(value && playingAreaArr[i+this.currentPos.column]){
              doTheyFit = false;
              break;
            }
        }
        return doTheyFit
    }

    get current_row_minus_current_height(): number {
        return this.currentPos.row-this.currentPos.current_height;
    }


    get last_index_of_block(): number {
        var lastIndex = 0;
        for(var i=0; i<this.currentRect.length; i++){
            var row = this.currentRect[i]
            if(!row){ continue; }
            let currentLastIndex = row.lastIndexOf(1)
            if(currentLastIndex > lastIndex && currentLastIndex !== -1){
                lastIndex = currentLastIndex;
            }
        }
        return lastIndex;
    }

    get first_index_of_block(): number {
        var firstIndex = 0;
        for(var i=0; i<this.currentRect.length; i++){
            var row = this.currentRect[i]
            if(!row){ continue; }
            let currentFirstIndex = row.indexOf(1)
            if(currentFirstIndex < firstIndex && currentFirstIndex !== -1){
                firstIndex = currentFirstIndex;
            }
        }
        return firstIndex;
    }


    get current_column_plus_current_width(): number {
        return this.currentPos.column+this.currentPos.current_width;
    }

    get current_column_minus_where_block_starts(): number {
        return this.currentPos.column-this.first_index_of_block;
    }


    get current_empty_spaces(): spacesOfBox {
        let spacesFromTop = 0;
        let lastFoundIndex = 0;
        let foundBlock = false
        for(var i=0; i<this.currentRect.length; i++){
            if(!this.currentRect[i].includes(1) && !foundBlock){
                spacesFromTop++
            } 
            if (this.currentRect[i].includes(1)){
                lastFoundIndex = i+1;
                foundBlock = true
            }
        }

        return {
            spaces_from_top: spacesFromTop,
            spaces_from_bottom: this.currentRect.length-lastFoundIndex
        }
    }

    get color(): number {
        return this.config.color;
    }

    get current_height(): number {
        var height = 0;
        for(var i=0; i<this.currentRect[0].length; i++){
            if(this.currentRect[i].includes(1)){
                height++
            }
        }
        return height;
    }

    get current_width(): number {
        let width = new Array(this.currentRect.length).fill(0);
        this.currentRect.forEach(arrInside => {
              arrInside.forEach((haveBlock, indexOfBlock) => {
                if(haveBlock && !width[indexOfBlock]){
                  width[indexOfBlock] = 1;
                }
              })
        });
        var firstIndex = width.indexOf(1)
        var lastIndex = width.lastIndexOf(1)
        if(firstIndex == lastIndex) return 1;
        return lastIndex-firstIndex+1
    }
}