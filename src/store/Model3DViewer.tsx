import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface ModelPart { label: string; url: string }
interface Props { parts: ModelPart[]; color?: string; mini?: boolean }

export default function Model3DViewer({ parts, color = '#1c1c1c', mini = false }: Props) {
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

    // Use actual rendered width; fall back to 320 if layout hasn't happened yet
    const W = wrap.clientWidth || 320
    const H = mini ? wrap.clientHeight || Math.round(W * 0.75) : Math.round(W * 0.75)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f0ede9')

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 1000)
    camera.position.set(0, 1.5, 7)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mini ? 1.5 : 2))
    if (mini) renderer.domElement.style.pointerEvents = 'none'
    mount.appendChild(renderer.domElement)

    // Three-point lighting
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.65))
    const key = new THREE.DirectionalLight(0xffffff, 0.9)
    key.position.set(5, 8, 5)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xfff0e0, 0.25)
    fill.position.set(-5, 1, -4)
    scene.add(fill)
    scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 0.12), {
      position: new THREE.Vector3(0, -4, -6)
    }))

    const controls = mini ? null : (() => {
      const c = new OrbitControls(camera, renderer.domElement)
      c.enableDamping = true
      c.dampingFactor = 0.07
      c.autoRotate = true
      c.autoRotateSpeed = 1.4
      c.enablePan = false
      c.minDistance = 2
      c.maxDistance = 14
      return c
    })()

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.42,
      metalness: 0.06,
    })

    // Load ALL parts simultaneously — display as combined assembly
    const loader = new ThreeMFLoader()
    const assembly = new THREE.Group()
    let rotY = 0

    Promise.all(
      parts.map(p => new Promise<void>(resolve => {
        loader.load(p.url, obj => { assembly.add(obj); resolve() }, undefined, () => resolve())
      }))
    ).then(() => {
      if (assembly.children.length === 0) {
        setError(true)
        setLoading(false)
        return
      }
      assembly.traverse(child => {
        if ((child as THREE.Mesh).isMesh) (child as THREE.Mesh).material = mat
      })
      // Center + scale the full assembly
      const box = new THREE.Box3().setFromObject(assembly)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      assembly.position.copy(center).negate()
      assembly.scale.setScalar(3.8 / Math.max(size.x, size.y, size.z))
      scene.add(assembly)
      setLoading(false)
    })

    let animId: number
    function animate() {
      animId = requestAnimationFrame(animate)
      if (mini) {
        rotY += 0.008
        assembly.rotation.y = rotY
      } else {
        controls!.update()
      }
      renderer.render(scene, camera)
    }
    animate()

    function handleResize() {
      const w = wrap!.clientWidth
      const h = mini ? wrap!.clientHeight || Math.round(w * 0.75) : Math.round(w * 0.75)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      controls?.dispose()
      renderer.dispose()
      if (mount?.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [parts, color, mini])

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

  return (
    <div ref={wrapRef} className="mv-root">
      <div ref={mountRef} className="mv-canvas" />
      {loading && !error && (
        <div className="mv-loading">
          <div className="mv-spinner" />
          <span>Loading 3D model…</span>
        </div>
      )}
      {error && <div className="mv-loading"><span>Could not load model</span></div>}
      {!loading && !error && (
        <div className="mv-hint" aria-hidden="true">Drag to rotate</div>
      )}
    </div>
  )
}
