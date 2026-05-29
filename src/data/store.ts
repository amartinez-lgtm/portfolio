export interface ModelPart {
  label: string
  url: string
}

export interface StoreProduct {
  id: string
  name: string
  type: 'physical' | 'digital'
  description: string
  price: string
  tags: string[]
  image?: string
  images?: string[]
  model3d?: { parts: ModelPart[]; color?: string; rotationX?: number; rotationZ?: number }
  status: 'available' | 'coming-soon'
  downloadUrl?: string
}

export const storeProducts: StoreProduct[] = [
  {
    id: 'nfc-token',
    name: 'NFC Portfolio Token',
    type: 'physical',
    description:
      'The same 3D-printed smart object used as a business card. Embed an NFC chip, program it to any URL. Fully customizable.',
    price: 'Made to Order',
    tags: ['Tech', 'Networking'],
    status: 'available',
  },
  {
    id: 'light-switch-cover',
    name: 'Light Switch Cover',
    type: 'physical',
    description:
      'Clean replacement covers for standard Decora-style light switches. Custom color and finish on request.',
    price: 'Made to Order',
    tags: ['Home', 'Hardware'],
    status: 'available',
  },
  {
    id: 'planter-pot-small',
    name: 'Planter Pot — Small',
    type: 'physical',
    description:
      'Compact desktop planter sized for succulents and 4" pots. Drainage hole included.',
    price: 'Made to Order',
    tags: ['Home', 'Garden'],
    status: 'available',
  },
  {
    id: 'planter-pot-large',
    name: 'Planter Pot — Large',
    type: 'physical',
    description:
      'Full-size planter with a geometric structured form. Fits 6–8" root ball. Drain plug included.',
    price: 'Made to Order',
    tags: ['Home', 'Garden'],
    status: 'available',
  },
  {
    id: 'paper-towel-dispenser',
    name: 'Paper Towel Dispenser',
    type: 'physical',
    description:
      'Wall-mounted holder for multifold paper towels. Minimal rounded form, mounts flush to the wall with no visible hardware. Available in Matte Black, White, or Gray.',
    price: 'Made to Order',
    tags: ['Home', 'Kitchen', 'Bathroom'],
    image: '/products/ptd-ai-hero.png',
    images: ['/products/ptd-2.jpeg', '/products/ptd-3.jpeg'],
    model3d: {
      parts: [
        { label: 'Assembly', url: '/products/ptd-assembly.3mf' },
      ],
      color: '#909090',
      rotationX: -Math.PI / 2,
      rotationZ: -Math.PI / 2,
    },
    status: 'available',
  },
  {
    id: 'soap-dispenser',
    name: 'Soap Dispenser',
    type: 'physical',
    description:
      'Countertop pump dispenser in a cylindrical form. Pairs with the paper towel dispenser. Standard pump thread.',
    price: 'Made to Order',
    tags: ['Home', 'Kitchen', 'Bathroom'],
    status: 'available',
  },
  {
    id: 'light-switch-cover-stl',
    name: 'Light Switch Cover STL',
    type: 'digital',
    description:
      'Print-ready STL for the light switch cover. Works on any FDM printer. 0.2mm layer height recommended.',
    price: 'Free',
    tags: ['STL', 'Home'],
    status: 'coming-soon',
  },
  {
    id: 'planter-pot-stl',
    name: 'Planter Pot STL',
    type: 'digital',
    description:
      'Print-ready STL for the small desktop planter. Includes drain hole variant.',
    price: 'Free',
    tags: ['STL', 'Garden'],
    status: 'coming-soon',
  },
  {
    id: 'soap-dispenser-stl',
    name: 'Soap Dispenser STL',
    type: 'digital',
    description:
      'Print-ready STL for the soap dispenser body and pump collar. Standard M24 pump thread.',
    price: 'Free',
    tags: ['STL', 'Home'],
    status: 'coming-soon',
  },
]
