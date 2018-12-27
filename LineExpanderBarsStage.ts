const w : number = window.innerWidth
const h : number = window.innerHeight
const scDiv : number = 0.51
const scGap : number = 0.05
const sizeFactor : number = 2.7
const strokeFactor : number = 90
const nodes : number = 5
const lines : number = 4
class LineExpanderBarsStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : LineExpanderBarsStage = new LineExpanderBarsStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}
