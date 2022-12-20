import { N } from "./utils/namhai"
import { Texture, Plane, Mesh } from 'ogl'

export default class Media {
  constructor(gl, {
    src,
    img,
    bounds,
    program,
    scene,
    canvasSize,
    canvasSizePixel,
    index
  }) {
    if ((!src || !bounds) && !img) {
      throw 'Media, il manque quelque chose'
    }
    if (!program) {
      throw 'No program given'
    }

    this.index = index
    bounds && (this.bounds = bounds)
    if (!src && img) {
      src = N.Ga(img, 'data-src')
    }
    img && (this.bounds = img.getBoundingClientRect())


    let geometry = new Plane(gl, {
      heightSegments: 20,
      widthSegments: 20
    })

    this.mesh = new Mesh(gl, {
      geometry, program
    })

    this.mesh.setParent(scene)
    this.mesh.scale.x = this.bounds.width * canvasSize.width / canvasSizePixel.width
    this.mesh.scale.y = this.bounds.height * canvasSize.height / canvasSizePixel.height

    N.BM(this, ['update', 'resize'])

    this.raf = new N.RafR(this.update)
    this.ro = new N.ROR(this.resize)
  }
  init() {
    this.raf.run()
    this.ro.on()
  }

  update(e) {
  }

  resize() {
  }

}
