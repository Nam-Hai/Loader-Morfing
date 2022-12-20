import { Plane, Vec2, Geometry, Renderer, Camera, Transform, Texture, Program, Mesh, Text } from 'ogl'
import Preloader from './preloader'
import { N } from './utils/namhai'



export default class Canvas {
  constructor() {
    this.renderer = new Renderer({
      alpha: true
    })
    this.gl = this.renderer.gl

    document.body.appendChild(this.gl.canvas)

    this.camera = new Camera(this.gl)
    this.camera.position.z = 5
    this.scene = new Transform()

    this.onResize()

    this.page = new Preloader(this.gl, { canvasSize: this.size, scene: this.scene })
    N.BM(this, ['render', 'onResize'])

    this.raf = new N.RafR(this.render)
    this.ro = new N.ROR(this.onResize)

    this.init()
  }
  async init() {

    await this.page.init()

    this.raf.run()
    this.ro.on()
  }


  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.sizePixel = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.camera.perspective({
      aspect: this.sizePixel.width / this.sizePixel.height
    })
    const fov = this.camera.fov * Math.PI / 180

    const height = 2 * Math.tan(fov / 2) * this.camera.position.z
    this.size = {
      height: height,
      width: height * this.camera.aspect
    }

    this.page && this.page.onResize(this.size)
  }
  render() {
    this.page.render(this.camera)
  }


}

