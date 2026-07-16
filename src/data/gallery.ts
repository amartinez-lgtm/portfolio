export interface GalleryModelPart {
  label: string
  url: string
}

export interface GalleryPiece {
  id: string
  title: string
  /** The narrative — who or what the piece is. Shown under the title. */
  story: string
  /** e.g. "3D-printed PLA" or "Resin, hand-finished" */
  medium?: string
  year?: string
  tags: string[]
  model3d?: {
    parts: GalleryModelPart[]
    color?: string
    rotationX?: number
    rotationY?: number
    rotationZ?: number
  }
  image?: string
  images?: string[]
  /** 'coming-soon' renders a placeholder until the model/photo is uploaded. */
  status: 'available' | 'coming-soon'
}

// Art / sculpture — shown as work, not merchandise. No prices, no ordering.
// To make a piece live: drop its .3mf into public/gallery/ (filenames below),
// then flip status to 'available'.
export const galleryPieces: GalleryPiece[] = [
  {
    id: 'julia',
    title: 'Julia',
    // TODO: replace with Avelino's real words for this piece
    story:
      'A figure modeled and printed in-house — a study in form and proportion. The first live piece in the gallery.',
    medium: '3D-printed PLA',
    tags: ['Figure', 'Sculpture'],
    model3d: {
      parts: [{ label: 'Figure', url: '/gallery/julia.stl' }],
      color: '#c9c4bc',
    },
    status: 'available',
  },
  {
    id: 'abuela',
    title: 'Abuela',
    story:
      'A portrait bust of my grandmother, modeled and printed as a keepsake for the family. The first in an ongoing series capturing the people who raised me — the ones whose faces I want to keep long after.',
    medium: '3D-printed PLA',
    tags: ['Portrait', 'Family', 'Sculpture'],
    model3d: {
      parts: [{ label: 'Bust', url: '/gallery/abuela.3mf' }],
      color: '#c9c4bc',
    },
    status: 'coming-soon',
  },
  {
    id: 'tia',
    title: 'Tía',
    story:
      'A companion bust to Abuela — my aunt, rendered in the same series. Sculpted from life and printed at scale, part of an effort to hold onto the family in a form you can put on a shelf.',
    medium: '3D-printed PLA',
    tags: ['Portrait', 'Family', 'Sculpture'],
    model3d: {
      parts: [{ label: 'Bust', url: '/gallery/tia.3mf' }],
      color: '#c9c4bc',
    },
    status: 'coming-soon',
  },
  {
    id: 'figure-study',
    title: 'Figure Study',
    story:
      'A study of the human form — a move away from function toward pure sculpture, and a test of what the printer can hold. Figurative work in the classical sense: the body as subject, form as the whole point.',
    medium: '3D-printed PLA',
    tags: ['Figure', 'Sculpture', 'Study'],
    model3d: {
      parts: [{ label: 'Figure', url: '/gallery/figure-study.3mf' }],
      color: '#c9c4bc',
    },
    status: 'coming-soon',
  },
]
