const w : number = window.innerWidth
const h : number = window.innerHeight
const scDiv : number = 0.51
const scGap : number = 0.05
const sizeFactor : number = 2.7
const strokeFactor : number = 90
const nodes : number = 5
const lines : number = 4
const color : string = '#283593'

const maxScale : Function = (scale : number, i : number, n : number) : number => Math.max(0, scale - i / n)
const divideScale : Function = (scale : number, i : number, n : number) : number => Math.min(1/n, maxScale(scale, i, n)) * n
const scaleFactor : Function = (scale : number) : number => Math.floor(scale / scDiv)
const mirrorValue : Function = (scale : number, a : number, b : number) : number => {
    const k : number = scaleFactor(scale)
    return (1 - k) / a + k / b
}
const updateScale : Function = (scale : number, dir : number, a : number, b : number) : number => {
    return mirrorValue(scale, a, b) * dir * scGap
}

const drawLEBNode : Function = (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const gap : number = w / (nodes + 1)
    const size : number = gap / sizeFactor
    context.lineWidth = Math.min(w, h) / strokeFactor
    context.lineCap = 'round'
    context.strokeStyle = color
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    const xGap : number = (size) / (lines + 1)
    context.save()
    context.translate(gap * (i + 1), h/2)
    context.rotate(Math.PI/2 * sc2)
    for (var j = 0; j < lines; j++) {
        const sc = divideScale(sc1, j, lines)
        context.save()
        const jGap : number = (lines - j) * xGap
        for (var k = 0; k < 2; k++) {
            const x : number = jGap * (1 - 2 * (k % 2)) * sc
            context.beginPath()
            context.moveTo(0,0)
            context.lineTo(x, 0)
            context.stroke()
            context.save()
            context.translate(x, 0)
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(0, -xGap)
            context.stroke()
            context.restore()
        }
        context.restore()
    }
    context.restore()
}

class LineExpanderBarsStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()
    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        this.renderer = new Renderer()
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
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
        const stage : LineExpanderBarsStage = new LineExpanderBarsStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += updateScale(this.scale, this.dir, lines, 1)
        console.log(this.scale)
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
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LEBNode {
    prev : LEBNode
    next : LEBNode
    state : State = new State()
    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new LEBNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        drawLEBNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : LEBNode {
        var curr : LEBNode = this.prev
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

class LineExpanderBars {
    root : LEBNode = new LEBNode(0)
    curr : LEBNode = this.root
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
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
    leb : LineExpanderBars = new LineExpanderBars()
    animator : Animator = new Animator()
    render(context : CanvasRenderingContext2D) {
        this.leb.draw(context)
    }

    handleTap(cb : Function) {
        this.leb.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.leb.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
