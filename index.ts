const blocks : number = 5
const scGap : number = 0.02 / (blocks * 2)
const w : number = window.innerWidth
const h : number = window.innerHeight
const backColor : string = "#BDBDBD"
const colors : Array<string> = ["#009688", "#2196F3", "#f44336", "#4CAF50", "#3F51B5"]
const delay : number = 20
const strokeFactor : number = 90

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

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawBlock(context : CanvasRenderingContext2D, i : number, scale : number) {
        const wSize : number = w / (blocks + 1)
        const hSize : number = h / blocks
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, 3)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, 3)
        const sf3 : number = ScaleUtil.divideScale(sf, 2, 3)
        const sf1i : number = ScaleUtil.divideScale(sf1, i, blocks)
        const sf2i : number = ScaleUtil.divideScale(sf2, i, blocks)
        const sf3i : number = ScaleUtil.divideScale(sf3, i, blocks)
        context.save()
        context.translate(wSize * (i + 1) * sf2i, hSize * i)
        context.fillRect(0, 0, wSize * sf1i, hSize)
        if (i != blocks - 1 && sf3i > 0) {
            DrawingUtil.drawLine(context, wSize, 0, wSize + wSize * sf3i, hSize * sf3i)
        }
        context.restore()
    }

    static drawBlocks(context : CanvasRenderingContext2D, scale : number) {
        for (var i = 0; i < blocks; i++) {
            DrawingUtil.drawBlock(context, i, scale)
        }
    }

    static drawBSNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.fillStyle = colors[i]
        context.strokeStyle = colors[i]
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor
        DrawingUtil.drawBlocks(context, scale)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb  : Function) {
        this.scale += scGap * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class BSNode {

    state : State = new State()
    next : BSNode
    prev : BSNode

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new BSNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawBSNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : BSNode {
        var curr : BSNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class BlockStep {

    curr : BSNode = new BSNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    bs : BlockStep = new BlockStep()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.bs.draw(context)
    }

    handleTap(cb : Function) {
        this.bs.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.bs.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
