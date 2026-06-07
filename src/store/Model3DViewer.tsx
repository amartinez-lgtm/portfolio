import { useEffect, useRef, useState } from 'react'
import {
  Scene, Color, PerspectiveCamera, WebGLRenderer,
  AmbientLight, DirectionalLight, Vector3, Group,
  Box3, MeshStandardMaterial, type Mesh,
} from 'three'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface ModelPart { label: string; url: string }
interface Props { parts: ModelPart[]; color?: string; mini?: boolean; rotationX?: number; rotationY?: number; rotationZ?: number }

const HALF_PI = Math.PI / 2

export default function Model3DViewer({ parts, color = '#404040', mini = false, rotationX = 0, rotationY = 0, rotationZ = 0 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Calibration mode: append ?calibrate to the URL to dial in a model's orientation.
  // Freezes the spin and exposes 90° rotation buttons + a live readout to bake into store.ts.
  const calibrate = !mini && typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('calibrate')
  const [rot, setRot] = useState({ x: rotationX, y: rotationY, z: rotationZ })
  const [frozen, setFrozen] = useState(calibrate)
  const assemblyRef = useRef<Group | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const rotRef = useRef(rot)
  rotRef.current = rot

  // Live-apply calibration rotation to the loaded model without rebuilding the scene
  useEffect(() => {
    if (assemblyRef.current) assemblyRef.current.rotation.set(rot.x, rot.y, rot.z)
  }, [rot])

  // Freeze / resume auto-spin without rebuilding the scene
  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = !frozen
  }, [frozen])

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
      camera.position.set(0, 1.5, 7)
      camera.lookAt(0, 0, 0)

      renderer = new WebGLRenderer({ antialias: true, powerPreference: 'low-power' })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, mini ? 2 : 2.5))
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
        controls.autoRotate = !frozen
        controls.autoRotateSpeed = 1.4
        controls.enablePan = false
        controls.minDistance = 2
        controls.maxDistance = 14
        controlsRef.current = controls
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
      assemblyRef.current = assembly
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
        // Apply CAD orientation fix to inner assembly only (live-updatable in calibrate mode)
        assembly.rotation.set(rotRef.current.x, rotRef.current.y, rotRef.current.z)
        // Scale first, then recompute center — setting position before scale leaves model off-center
        const rawBox = new Box3().setFromObject(spinner)
        const rawSize = rawBox.getSize(new Vector3())
        spinner.scale.setScalar(4.5 / Math.max(rawSize.x, rawSize.y, rawSize.z))
        const scaledBox = new Box3().setFromObject(spinner)
        spinner.position.copy(scaledBox.getCenter(new Vector3())).negate()
        scene.add(spinner)
        setLoading(false)
      })

      const animate = () => {
        animId = requestAnimationFrame(animate)
        if (mini) {
          rotY += 0.004
          spinner.rotation.y = rotY
        } else {
          controls!.update()
        }
        renderer!.render(scene, camera)
      }
      animate()

      const handleResize = () => {
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
    // frozen/rot are applied live via separate effects, so they intentionally stay out of deps
    // to avoid rebuilding the scene on every calibration tap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts, color, mini, rotationX, rotationY, rotationZ])

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
      {showDragHint && !calibrate && (
        <div className="mv-hint" aria-hidden="true">Drag to rotate</div>
      )}
      {calibrate && !loading && !error && (
        <CalibratePanel
          rot={rot}
          frozen={frozen}
          onRotate={(axis, dir) => setRot(r => ({ ...r, [axis]: r[axis] + dir * HALF_PI }))}
          onReset={() => setRot({ x: 0, y: 0, z: 0 })}
          onToggleFreeze={() => setFrozen(f => !f)}
        />
      )}
    </div>
  )
}

function fmt(v: number) {
  const turns = v / Math.PI
  // normalize to a readable -2..2 range of π
  const norm = ((turns % 2) + 2) % 2
  const signed = norm > 1 ? norm - 2 : norm
  return `${signed.toFixed(2)}π`
}

function CalibratePanel({
  rot, frozen, onRotate, onReset, onToggleFreeze,
}: {
  rot: { x: number; y: number; z: number }
  frozen: boolean
  onRotate: (axis: 'x' | 'y' | 'z', dir: 1 | -1) => void
  onReset: () => void
  onToggleFreeze: () => void
}) {
  const code = `rotationX: ${rot.x.toFixed(4)}, rotationY: ${rot.y.toFixed(4)}, rotationZ: ${rot.z.toFixed(4)}`
  return (
    <div className="mv-cal">
      <div className="mv-cal__title">Calibrate orientation</div>
      <div className="mv-cal__axes">
        {(['x', 'y', 'z'] as const).map(axis => (
          <div key={axis} className="mv-cal__axis">
            <button onClick={() => onRotate(axis, -1)} aria-label={`${axis} minus`}>−</button>
            <span className="mv-cal__label">{axis.toUpperCase()} {fmt(rot[axis])}</span>
            <button onClick={() => onRotate(axis, 1)} aria-label={`${axis} plus`}>+</button>
          </div>
        ))}
      </div>
      <div className="mv-cal__row">
        <button className="mv-cal__btn" onClick={onToggleFreeze}>
          {frozen ? '▶ Spin' : '⏸ Freeze'}
        </button>
        <button className="mv-cal__btn" onClick={onReset}>Reset</button>
      </div>
      <div className="mv-cal__code">{code}</div>
      <div className="mv-cal__hint">Send these numbers to Avelino</div>
    </div>
  )
}
