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
