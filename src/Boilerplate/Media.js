import { Mesh, Program, Texture, Vec2 } from 'ogl'
import { N } from '../../../utils/namhai'

const OPACITY = 0.4
export default class {
    constructor({ element, gl, geometry, scene, index, sizes, canvasSize }) {
        this.canvasSize = canvasSize
        this.sizes = sizes
        this.gl = gl
        this.geometry = geometry
        this.element = element
        this.scene = scene

        this.index = index || null


        this.createTexture()
        this.createProgram()
        this.createMesh()


        this.getBounds()
    }

    createTexture() {
        this.texture = new Texture(this.gl)

        this.image = new window.Image();
        this.image.crossOrigin = 'anonymous'
        this.image.src = this.element.getAttribute('data-src')
        this.image.onload = () => {
            this.texture.image = this.image
        }

    }

    createProgram() {
        this.program = new Program(this.gl, {
            fragment,
            vertex,
            uniforms: {

                tMap: {
                    value: this.texture
                }
            }
        })
    }

    createMesh() {
        this.mesh = new Mesh(this.gl, {
            geometry: this.geometry,
            program: this.program
        })

        this.mesh.setParent(this.scene)

        this.mesh.rotation.z = N.Rand.range(-galeryRotationBound, galeryRotationBound)
    }

    getBounds() {
        this.boundsPixel = this.element.getBoundingClientRect();
        this.updateScale()
        this.updatePos()

    }

    updateScale() {
        // la nouvelle taille l'image
        this.width = this.boundsPixel.width / this.canvasSize.width
        this.height = this.boundsPixel.height / this.canvasSize.height

        this.mesh.scale.x = this.sizes.width * this.width
        this.mesh.scale.y = this.sizes.height * this.height

    }

    updatePos() {

    }

    update({ dT }) {
    }

    onResize({ params }) {
        this.getBounds()
    }

    show() {

    }

    hide() {

    }
}

