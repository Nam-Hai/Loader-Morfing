import { Plane, Vec2, Geometry, Renderer, Camera, Transform, Texture, Program, Mesh, Text } from 'ogl'
import { N } from './utils/namhai'

import { shader as MSDFFrag } from './shaders/fontShader/MSDF_frag.js'
import MSDFVer from './shaders/fontShader/MSDF_vertex.glsl?raw'
import PlaneBufferTarget from './PlaneBufferTarget'

import BasicFrag from './shaders/BasicFrag'
import BasicVer from './shaders/BasicVer.glsl?raw'

export default class Canvas {
  constructor() {
    this.renderer = new Renderer({
      // alpha: true
    })
    this.gl = this.renderer.gl

    document.body.appendChild(this.gl.canvas)

    this.camera = new Camera(this.gl)
    this.camera.position.z = 5
    this.scene = new Transform()

    this.coverRatio = { value: new Vec2() }
    this.onResize()

    N.BM(this, ['update', 'onResize', 'onScroll'])



    this.raf = new N.RafR(this.update)
    this.ro = new N.ROR(this.onResize)

    this.init()
  }
  async init() {
    this.bgMesh = new Mesh(this.gl, {
      geometry: new Plane(this.gl, { width: this.size.width, height: this.size.height }),
      program: new Program(this.gl, {
        fragment: BasicFrag,
        vertex: BasicVer,
        detphTest: false,
        depthWrite: false
      })
    })
    this.bgMesh.setParent(this.scene)
    this.preloaderText = await this.createText('00')
    this.preloaderText.program.uniforms.uAlpha.value = 1
    this.preloaderTextBuffer = await this.createText('23')
    this.preloaderTextBuffer.program.uniforms.uAlpha.value = 0

    this.post = new PlaneBufferTarget(this.gl, this.size)

    this.addEventListener()
    this.post.init()
    this.raf.run()
    this.ro.on()
  }
  addEventListener() {
    // document.addEventListener('wheel', this.onScroll)
    let tl = new N.TL()
    tl.from({
      d: 2000,
      e: 'io3',
      update: t => {
        if (t.prog < 0.5) {
          this.post.mesh.program.uniforms.progE.value = N.Ease.io4(N.Clamp(t.prog * 2, 0, 1))
        } else {
          this.post.mesh.program.uniforms.progE.value = N.Ease.io4(1 - N.Clamp(-1 + t.prog * 2, 0, 1))
        }
      },
    })
    tl.from({
      d: 2000,
      delay: 0,
      // e: 'i3',
      update: t => {
        this.preloaderText.program.uniforms.uAlpha.value = 1 - t.progE
      }
    })
    tl.from({
      d: 2000,
      delay: 0,
      // e: 'o3',
      update: t => {
        this.preloaderTextBuffer.program.uniforms.uAlpha.value = t.progE
      }

    })
    tl.from({
      delay: 2121,
      d: 0,
      p: [],
      cb: async _ => {
        // this.preloaderTextBuffer.program.uniforms.uAlpha.value = 0
        // this.preloaderText.program.uniforms.uAlpha.value = 1
        this.preloaderText.setParent(null)
        this.preloaderText = null
        this.preloaderText = this.preloaderTextBuffer
        this.preloaderTextBuffer = await this.createText(N.ZL(N.Rand.range(0, 99, 0)))
        // this.preloaderTextBuffer.position.x += N.Rand.range(-0.5, 0.5)
        // this.preloaderTextBuffer.position.y += N.Rand.range(-0.5, 0.5)
        // let randir = this.post.randomizeDir()
        // this.preloaderTextBuffer.position.x += randir.value.x / 2
        // this.preloaderTextBuffer.position.y += randir.value.y / 2



      }
    })
    document.addEventListener('click', () => {

      // tl.play()

      setInterval(_ => tl.play(), 2200)
    })
  }

  onScroll(e) {
    this.scroll.target += e.deltaY / 100
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

    this.bgMesh && this.bgMesh.scale.set(this.size.width, this.size.height, 1)

    innerWidth > innerHeight ? this.coverRatio.value.set(innerHeight / innerWidth, 1) : this.coverRatio.value.set(1, innerWidth / innerHeight)
    this.post && this.post.onResize(this.size)

  }
  update(e) {

    this.renderer.render({
      scene: this.scene,
      camera: this.camera,
      target: this.post.target
    })
    // this.post.mesh.program.uniforms.tMap.value = this.post.target.texture

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

