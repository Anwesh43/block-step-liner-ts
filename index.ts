const blocks : number = 5
const scGap : number = 0.02 / blocks
const w : number = window.innerWidth
const h : number = window.innerHeight
const backColor : string = "#BDBDBD"
const colors : Array<string> = ["#009688", "#2196F3", "#f44336", "#4CAF50", "#3F51B5"]

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawBlock(context : CanvasRenderingContext2D, i : number, scale : number) {
        const wSize : number = w / blocks
        const hSize : number = h / blocks
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, 2)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, 2)
        context.save()
        context.translate(wSize * i * sf1, hSize * i)
        context.fillRect(0, 0, wSize * sf2, hSize)
        context.restore()
    }

    static drawBlocks(context : CanvasRenderingContext2D, scale : number) {
        for (var i = 0; i < 5; i++) {
            DrawingUtil.drawBlock(context, i, scale)
        }
    }

    static drawBSNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.fillStyle = colors[i]
        DrawingUtil.drawBlocks(context, scale)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context2D : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}
