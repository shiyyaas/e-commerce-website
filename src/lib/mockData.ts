import { Product } from '../types/database';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    title: 'Modular Desk Pad & Cable Rail',
    description: 'Full-grain top surface paired with recycled felt foundation. Includes magnetic snap-in brass cable guides designed for minimal desk setups.',
    price: 78.00,
    stock: 14,
    image_urls: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=900&q=80'
    ],
    category: 'Workspace',
    attributes: {
      dimensions: '900 x 400 mm',
      material: 'Vegan Leather / Felt',
      weight: '680g'
    },
    featured: true,
    badge_color: 'lime',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-002',
    title: 'Monolith Mechanical Keyboard',
    description: 'Solid anodized aluminum chassis with custom lubricated tactile switches and dye-sub PBT keycaps. Crisp acoustic resonance with minimal footprint.',
    price: 220.00,
    stock: 8,
    image_urls: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80'
    ],
    category: 'Hardware',
    attributes: {
      layout: '75% ANSI',
      switches: 'Tactile Studio 62g',
      connectivity: 'USB-C / 2.4GHz'
    },
    featured: true,
    badge_color: 'lilac',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-003',
    title: 'Acoustic Felt Story Pinboard',
    description: 'Porous geometric sound-dampening acoustic wall panel with flush edge brackets. Holds swatches, sketches, and sticky notes seamlessly.',
    price: 95.00,
    stock: 20,
    image_urls: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80'
    ],
    category: 'Workspace',
    attributes: {
      dimensions: '600 x 900 mm',
      material: 'Acoustic PET Felt',
      color: 'Pebble Cream'
    },
    featured: false,
    badge_color: 'cream',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-004',
    title: 'Editorial Grid Notebooks (Set of 3)',
    description: '120gsm fountain-pen friendly Japanese cream paper with 4mm micro-dot grid and lay-flat exposed Swiss binding in pastel palette covers.',
    price: 32.00,
    stock: 45,
    image_urls: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80'
    ],
    category: 'Paper & Print',
    attributes: {
      pages: '160 per book',
      binding: 'Layflat Swiss',
      paper: '120gsm Cream'
    },
    featured: true,
    badge_color: 'mint',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-005',
    title: 'Cast Aluminum Angle Lamp',
    description: 'Counterweighted swivel desk task light with diffused high-CRI (98+) warm LED puck and step-less tactile brass dial.',
    price: 185.00,
    stock: 6,
    image_urls: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80'
    ],
    category: 'Lighting',
    attributes: {
      cri: '98.5',
      temperature: '2700K - 4000K',
      power: '12W LED'
    },
    featured: true,
    badge_color: 'coral',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-006',
    title: 'Precision Drafting Pen 0.5',
    description: 'Single-block machined aerospace grade titanium pen body with ceramic rollerball mechanism. Perfectly balanced at center of gravity.',
    price: 64.00,
    stock: 30,
    image_urls: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=900&q=80'
    ],
    category: 'Paper & Print',
    attributes: {
      refill: 'Schmidt P8126 Rollerball',
      finish: 'Matte Bead-Blasted',
      length: '136 mm'
    },
    featured: false,
    badge_color: 'pink',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-007',
    title: 'Canvas Portfolio Carrier 16"',
    description: 'Weatherproof heavyweight 18oz duck cotton canvas with padded interior dividers for laptop, sketch tablet, and documents.',
    price: 140.00,
    stock: 11,
    image_urls: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80'
    ],
    category: 'Bags & Carry',
    attributes: {
      capacity: '16 Liters',
      hardware: 'Solid Gunmetal Brass',
      water_resistance: 'DWR Waxed Treatment'
    },
    featured: false,
    badge_color: 'navy',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-008',
    title: 'Ergonomic Cast Armrest Rest Pillow',
    description: 'Molded high-density memory foam topped with breathable knitted merino wool slipcover. Relieves wrist fatigue during long design sessions.',
    price: 42.00,
    stock: 25,
    image_urls: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80'
    ],
    category: 'Workspace',
    attributes: {
      cover: '100% Merino Wool',
      dimensions: '360 x 80 x 20 mm',
      washable: 'Yes (Removable Cover)'
    },
    featured: false,
    badge_color: 'cream',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
