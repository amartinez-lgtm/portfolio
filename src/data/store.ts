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
  model3d?: { parts: ModelPart[]; color?: string; rotationX?: number; rotationY?: number; rotationZ?: number }
  status: 'available' | 'coming-soon'
  downloadUrl?: string
}

export const storeProducts: StoreProduct[] = [
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
    model3d: {
      parts: [
        { label: 'Body', url: '/products/soap-part-1.3mf' },
        { label: 'Collar', url: '/products/soap-part-2.3mf' },
      ],
      color: '#909090',
    },
    status: 'available',
  },
  {
    id: 'light-switch-pot',
    name: 'Light Switch Pot',
    type: 'physical',
    description:
      'Wall-mounted planter that installs around a standard light switch. Turns dead wall space into a live plant display. No tools required.',
    price: 'Made to Order',
    tags: ['Home', 'Garden', 'Hardware'],
    model3d: {
      parts: [
        { label: 'Part 1', url: '/products/lsc-part-1.3mf' },
        { label: 'Part 2', url: '/products/lsc-part-2.3mf' },
        { label: 'Part 3', url: '/products/lsc-part-3.3mf' },
        { label: 'Part 4', url: '/products/lsc-part-4.3mf' },
        { label: 'Part 5', url: '/products/lsc-part-5.3mf' },
      ],
      color: '#7a9e7e',
    },
    status: 'available',
  },
  {
    id: 'candle-holder',
    name: 'Candle Holder',
    type: 'physical',
    description:
      'Minimal geometric candle holder for standard taper and pillar candles. Weighted base, clean lines.',
    price: 'Made to Order',
    tags: ['Home', 'Decor'],
    model3d: {
      parts: [
        { label: 'Assembly', url: '/products/candle-assembly.3mf' },
      ],
      color: '#c8a87a',
    },
    status: 'available',
  },
  {
    id: 'bookshelf',
    name: 'Book Shelf',
    type: 'physical',
    description:
      'Wall-mounted shelf for books, plants, or objects. Minimal floating form with no visible brackets.',
    price: 'Made to Order',
    tags: ['Home', 'Furniture'],
    model3d: {
      parts: [
        { label: 'Assembly', url: '/products/shelf-assembly.3mf' },
      ],
      color: '#a0856a',
    },
    status: 'available',
  },
  {
    id: 'display-stand',
    name: 'Display Stand',
    type: 'physical',
    description:
      'Elevated riser stand that lifts objects off the surface. Clean minimal form, works for plants, decor, or any display piece.',
    price: 'Made to Order',
    tags: ['Home', 'Decor'],
    model3d: {
      parts: [
        { label: 'Assembly', url: '/products/stand-assembly.3mf' },
      ],
      color: '#909090',
    },
    status: 'available',
  },
]
