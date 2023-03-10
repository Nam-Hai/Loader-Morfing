import { Plane, Vec2, Geometry, Renderer, Camera, Transform, Texture, Program, Mesh, Text } from 'ogl'
import { N } from './utils/namhai'

import { shader as MSDFFrag } from './shaders/fontShader/MSDF_frag.js'
import MSDFVer from './shaders/fontShader/MSDF_vertex.glsl?raw'
import PlaneBufferTarget from './PlaneBufferTarget'

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

    this.coverRatio = { value: new Vec2() }
    this.onResize()

    N.BM(this, ['update', 'onResize'])

    this.raf = new N.RafR(this.update)
    this.ro = new N.ROR(this.onResize)

    this.init()
  }
  async init() {

    this.preloaderText = await this.createText('00')
    this.preloaderText.program.uniforms.uAlpha.value = 1
    this.preloaderTextBuffer = await this.createText('23')
    this.preloaderTextBuffer.program.uniforms.uAlpha.value = 0

    this.post = new PlaneBufferTarget(this.gl, this.size)

    this.post.init()
    this.raf.run()
    this.ro.on()
    this.initAnimation()
  }
  initAnimation() {
    let tl = new N.TL()
    tl.from({
      d: 500,
      e: 'io3',
      update: t => {
        this.post.mesh.program.uniforms.progE.value = t.progE
      }
    })
    tl.from({
      d: 500,
      delay: 500,
      e: 'io3',
      update: t => {
        this.post.mesh.program.uniforms.progE.value = 1 - t.progE
      }
    })

    tl.from({
      d: 800,
      delay: 0,
      update: t => {
        this.preloaderTextBuffer.program.uniforms.uAlpha.value = t.progE
      },
    })
    tl.from({
      d: 1000,
      delay: 0,
      update: t => {
        this.preloaderText.program.uniforms.uAlpha.value = 1 - t.progE
      },
      cb: async _ => {
        this.preloaderText.setParent(null)
        this.preloaderText = null
        this.preloaderText = this.preloaderTextBuffer
        this.preloaderTextBuffer = await this.createText(N.ZL(N.Rand.range(0, 99, 0)))
      }
    })
    setInterval(_ => tl.play(), 2000)
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

    innerWidth > innerHeight ? this.coverRatio.value.set(innerHeight / innerWidth, 1) : this.coverRatio.value.set(1, innerWidth / innerHeight)
    this.post && this.post.onResize(this.size)
  }
  update(e) {
    this.renderer.render({
      scene: this.scene,
      camera: this.camera,
      target: this.post.target
    })

    this.renderer.render({
      scene: this.post.mesh,
      camera: this.camera
    })
  }

  async createText(string) {
    const tDist = new Texture(this.gl)
    const iDist = new Image()
    iDist.onload = () => (tDist.image = iDist)
    iDist.src = 'normal.jpg'

    const font = await (await fetch('fonts/Humane-SemiBold.json')).json();
    const texture = new Texture(this.gl, {
      generateMipmaps: false,
    });
    const img = new Image();
    img.onload = () => (texture.image = img);
    img.src = 'fonts/Humane.png';

    const resolution = { value: new Vec2() }
    resolution.value.set(innerWidth, innerHeight)
    const program = new Program(this.gl, {
      // Get fallback shader for WebGL1 - needed for OES_standard_derivatives ext
      vertex: MSDFVer,
      fragment: MSDFFrag,
      uniforms: {
        tMap: { value: texture },
        uAlpha: { value: 0 },
        coverRatio: { value: this.coverRatio }
      },
      transparent: true,
      cullFace: null,
      depthWrite: false,
    });
    const text = new Text({
      font,
      text: string,
      width: 4,
      align: 'center',
      letterSpacing: -0.0,
      size: 2,
      lineHeight: 1,
    });

    // Pass the generated buffers into a geometry
    const geometry = new Geometry(this.gl, {
      position: { size: 3, data: text.buffers.position },
      uv: { size: 2, data: text.buffers.uv },
      // id provides a per-character index, for effects that may require it
      id: { size: 1, data: text.buffers.id },
      index: { data: text.buffers.index },
    });

    const mesh = new Mesh(this.gl, { geometry, program });

    mesh.setParent(this.scene)
    this.textHeight = text.height
    // Use the height value to position text vertically. Here it is centered.
    mesh.position.y += text.height * 0.5;
    // mesh.rotation.z = -Math.PI / 2
    return mesh
  }
}

