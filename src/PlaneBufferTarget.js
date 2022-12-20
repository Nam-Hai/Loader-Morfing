import { Vec2, RenderTarget, Texture, Program, Plane, Mesh } from 'ogl'
import PostFrag from './shaders/PostFrag.js'
import BasicVer from './shaders/BasicVer.glsl?raw'
import { N } from './utils/namhai'

export default class PlaneBufferTarget {

  constructor(gl, size) {

    this.gl = gl

    const tDist = new Texture(this.gl, { wrapS: this.gl.REPEAT, wrapT: this.gl.REPEAT })
    const iDist = new Image()
    iDist.onload = () => (tDist.image = iDist)
    iDist.src = 'normal.jpg'

    this.target = new RenderTarget(this.gl)
    this.randDir = { value: new Vec2() }
    this.randomizeDir()

    this.coverRatio = { value: innerWidth > innerHeight ? new Vec2(innerHeight / innerWidth, 1) : new Vec2(1, innerWidth / innerHeight) }
    let program = new Program(this.gl, {
      fragment: PostFrag,
      vertex: BasicVer,
      uniforms: {
        tMap: {
          value: this.target.texture
        },
        tDist: {
          value: tDist
        },
        coverRatio: this.coverRatio,
        time: { value: 0 },
        progE: { value: 0 },
        randDir: this.randDir
      }
    })

    this.mesh = new Mesh(this.gl, {
      geometry: new Plane(this.gl),
      program,
    })


    this.mesh.scale.x = size.width
    this.mesh.scale.y = size.height
    this.mesh.position.x = 0
    this.mesh.position.y = 0

    N.BM(this, ['update', 'onResize'])

    this.raf = new N.RafR(this.update)
  }
  randomizeDir() {
    this.randDir.value.set(Math.random() * 2 - 1, Math.random() * 2 - 1)
    return this.randDir
  }
  init() {
    this.raf.run()
  }
  onResize(canvasSize) {
    console.log('yooo');
    this.mesh.scale.set(canvasSize.width, canvasSize.height)
    innerWidth > innerHeight ? this.coverRatio.value.set(innerHeight / innerWidth, 1) : this.coverRatio.value.set(1, innerWidth / innerHeight)
    this.target.setSize(innerWidth, innerHeight)
  }

  update(e) {
    this.mesh.program.uniforms.time.value = e.elapsed / 2000
  }
}
