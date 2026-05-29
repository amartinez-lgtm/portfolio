import { useEffect, useRef, useState } from 'react'
import {
  Scene, Color, PerspectiveCamera, WebGLRenderer,
  AmbientLight, DirectionalLight, Vector3, Group,
  Box3, MeshStandardMaterial, type Mesh,
} from 'three'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface ModelPart { label: string; url: string }
interface Props { parts: ModelPart[]; color?: string; mini?: boolean; rotationX?: number }

export default function Model3DViewer({ parts, color = '#404040', mini = false, rotationX = 0 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const wrap = wrapRef.current
    const mount = mountRef.current
    if (!wrap || !mount) return

    setLoading(true)
    setError(false)

    let animId: number | undefined
    let renderer: WebGLRenderer | null = null
    let controls: OrbitControls | null = null

    try {
      const W = wrap.clientWidth || 320
      const H = mini ? wrap.clientHeight || Math.round(W * 0.75) : Math.round(W * 0.75)

      const scene = new Scene()
      scene.background = new Color('#111111')

      const camera = new PerspectiveCamera(42, W / H, 0.1, 1000)
      camera.position.set(4, 3, 5.5)

      renderer = new WebGLRenderer({ antialias: !mini, powerPreference: 'low-power' })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, mini ? 1.5 : 2))
      if (mini) renderer.domElement.style.pointerEvents = 'none'
      mount.appendChild(renderer.domElement)

      // Product lighting — high ambient so dark models stay visible
      scene.add(new AmbientLight(0xffffff, 0.55))
      const key = new DirectionalLight(0xffffff, 3.5)
      key.position.set(4, 7, 4)
      scene.add(key)
      const rim = new DirectionalLight(0x88aaff, 1.8)
      rim.position.set(-5, 3, -6)
      scene.add(rim)
      const bottom = new DirectionalLight(0xffffff, 0.3)
      bottom.position.set(0, -4, 2)
      scene.add(bottom)

      // Full viewer: OrbitControls with touch support (drag / pinch to manipulate)
      // Mini viewer: constant auto-spin, no controls
      if (!mini) {
        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.07
        controls.autoRotate = true
        controls.autoRotateSpeed = 1.4
        controls.enablePan = false
        controls.minDistance = 2
        controls.maxDistance = 14
      }

      const mat = new MeshStandardMaterial({
        color: new Color(color),
        roughness: 0.45,
        metalness: 0.08,
      })

      const loader = new ThreeMFLoader()
      // spinner: outer group rotates on world Y; assembly: inner group holds orientation fix.
      // Two groups prevent Euler-angle interference when both x and y rotations would otherwise
      // combine on the same object and cause the model to orbit instead of spin in place.
      const spinner = new Group()
      const assembly = new Group()
      spinner.add(assembly)
      let rotY = 0

      Promise.all(
        parts.map(p => new Promise<void>(resolve => {
          loader.load(p.url, obj => { assembly.add(obj); resolve() }, undefined, () => resolve())
        }))
      ).then(() => {
        if (assembly.children.length === 0) { setError(true); setLoading(false); return }
        assembly.traverse(child => {
          if ((child as Mesh).isMesh) (child as Mesh).material = mat
        })
        // Apply CAD orientation fix to inner assembly only
        if (rotationX !== 0) assembly.rotation.x = rotationX
        // Scale first, then recompute center — setting position before scale leaves model off-center
        const rawBox = new Box3().setFromObject(spinner)
        const rawSize = rawBox.getSize(new Vector3())
        spinner.scale.setScalar(4.5 / Math.max(rawSize.x, rawSize.y, rawSize.z))
        const scaledBox = new Box3().setFromObject(spinner)
        spinner.position.copy(scaledBox.getCenter(new Vector3())).negate()
        scene.add(spinner)
        setLoading(false)
      })

      function animate() {
        animId = requestAnimationFrame(animate)
        if (mini) {
          rotY += 0.008
          spinner.rotation.y = rotY
        } else {
          controls!.update()
        }
        renderer!.render(scene, camera)
      }
      animate()

      function handleResize() {
        const w = wrap!.clientWidth
        const h = mini ? wrap!.clientHeight || Math.round(w * 0.75) : Math.round(w * 0.75)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer!.setSize(w, h)
      }
      window.addEventListener('resize', handleResize)

      return () => {
        if (animId !== undefined) cancelAnimationFrame(animId)
        window.removeEventListener('resize', handleResize)
        controls?.dispose()
        renderer?.dispose()
        if (renderer && mount?.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      }
    } catch {
      setError(true)
      setLoading(false)
      if (renderer) {
        try { renderer.dispose() } catch { /* ignore */ }
        try { if (mount?.contains(renderer.domElement)) mount.removeChild(renderer.domElement) } catch { /* ignore */ }
      }
    }
  }, [parts, color, mini, rotationX])

  if (mini) {
    return (
      <div ref={wrapRef} className="mv-mini-root">
        <div ref={mountRef} className="mv-mini-canvas" />
        {loading && !error && (
          <div className="mv-mini-overlay">
            <div className="mv-spinner" />
          </div>
        )}
      </div>
    )
  }

  const showDragHint = !loading && !error &&
    typeof window !== 'undefined' &&
    !window.matchMedia('(pointer: coarse)').matches

  return (
    <div ref={wrapRef} className="mv-root">
      <div ref={mountRef} className="mv-canvas" />
      {loading && !error && (
        <div className="mv-loading">
          <div className="mv-spinner" />
          <span>Loading 3D model…</span>
        </div>
      )}
      {error && <div className="mv-loading mv-loading--err"><span>◈</span><span>Could not load model</span></div>}
      {showDragHint && (
        <div className="mv-hint" aria-hidden="true">Drag to rotate</div>
      )}
    </div>
  )
}
