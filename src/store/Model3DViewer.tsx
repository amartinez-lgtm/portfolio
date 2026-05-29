import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface ModelPart {
  label: string
  url: string
}

interface Props {
  parts: ModelPart[]
  color?: string
}

export default function Model3DViewer({ parts, color = '#1a1a1a' }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [partIdx, setPartIdx] = useState(0)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    setLoading(true)
    setError(false)

    const W = mount.clientWidth || 400
    const H = Math.round(W * 0.75) // 4:3

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f0ede9')

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 1000)
    camera.position.set(0, 2, 7)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // Warm three-point lighting
    scene.add(new THREE.AmbientLight(0xfff8f0, 0.65))
    const key = new THREE.DirectionalLight(0xffffff, 0.9)
    key.position.set(5, 8, 5)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xfff0e0, 0.25)
    fill.position.set(-5, 1, -4)
    scene.add(fill)
    const rim = new THREE.DirectionalLight(0xffffff, 0.15)
    rim.position.set(0, -4, -6)
    scene.add(rim)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.4
    controls.enablePan = false
    controls.minDistance = 2
    controls.maxDistance = 14

    const loader = new ThreeMFLoader()
    loader.load(
      parts[partIdx].url,
      (object) => {
        const box = new THREE.Box3().setFromObject(object)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)

        object.position.copy(center).negate()
        object.scale.setScalar(3.8 / maxDim)

        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          roughness: 0.42,
          metalness: 0.06,
        })
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            (child as THREE.Mesh).material = mat
          }
        })

        scene.add(object)
        setLoading(false)
      },
      undefined,
      () => {
        setLoading(false)
        setError(true)
      }
    )

    let animId: number
    function animate() {
      animId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    function handleResize() {
      const w = mount!.clientWidth
      const h = Math.round(w * 0.75)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      renderer.dispose()
      if (mount?.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [parts, partIdx, color])

  return (
    <div className="mv-root">
      <div ref={mountRef} className="mv-canvas" />

      {loading && !error && (
        <div className="mv-loading">
          <div className="mv-spinner" />
          <span>Loading 3D model…</span>
        </div>
      )}

      {error && (
        <div className="mv-loading">
          <span>Could not load model</span>
        </div>
      )}

      {!loading && !error && (
        <div className="mv-hint" aria-hidden="true">Drag to rotate</div>
      )}

      {parts.length > 1 && (
        <div className="mv-parts">
          {parts.map((p, i) => (
            <button
              key={p.url}
              className={`mv-part-btn${i === partIdx ? ' mv-part-btn--active' : ''}`}
              onClick={() => setPartIdx(i)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
