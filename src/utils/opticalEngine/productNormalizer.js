/**
 * Unified Product Normalizer
 * Enriches and normalizes products so that all components receive
 * consistent variants, eyeglassesConfig, contactLensConfig, and sunglassesConfig.
 */

export function normalizeProduct(product) {
  if (!product) return null;

  // Determine normalized productType
  let productType = product.productType;
  if (!productType) {
    if (product.category === 'contact-lenses' || product.category === 'contact-lens') {
      productType = 'contact-lens';
    } else if (product.category === 'sunglasses') {
      productType = 'sunglasses';
    } else if (product.category === 'accessories') {
      productType = 'accessories';
    } else {
      productType = 'eyeglasses';
    }
  }

  // Normalize variants from colors or existing variants
  let variants = product.variants;
  if (!variants || variants.length === 0) {
    if (product.colors && product.colors.length > 0) {
      variants = product.colors.map((col, idx) => ({
        id: `var-${product.id}-${col.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        colorName: col.name,
        colorCode: col.hex,
        sku: `${(product.sku || product.id).toUpperCase()}-${col.name.slice(0, 3).toUpperCase()}`,
        price: product.price,
        compareAtPrice: product.mrp,
        stock: product.inStock ? 25 : 0,
        images: [col.image || product.primaryImage, ...(product.galleryImages || [])],
        isDefault: idx === 0
      }));
    } else {
      variants = [{
        id: `var-${product.id}-default`,
        colorName: 'Standard',
        colorCode: '#14232E',
        sku: (product.sku || product.id).toUpperCase(),
        price: product.price,
        compareAtPrice: product.mrp,
        stock: product.inStock ? 25 : 0,
        images: [product.primaryImage, ...(product.galleryImages || [])],
        isDefault: true
      }];
    }
  }

  // 1. Eyeglasses Configuration
  let eyeglassesConfig = product.eyeglassesConfig;
  if (productType === 'eyeglasses' && !eyeglassesConfig) {
    eyeglassesConfig = {
      lensTypes: ['frame-only', 'single-vision', 'progressive'],
      availableLenses: [
        {
          id: 'lens-anti-glare-156',
          name: 'Anti-Glare Standard 1.56',
          description: 'Anti-reflective & scratch-resistant multi-coated optical lenses.',
          price: 499,
          material: 'CR-39 Resin',
          index: '1.56',
          coating: 'Anti-Reflective Hydrophobic',
          applicableTypes: ['single-vision']
        },
        {
          id: 'lens-blue-cut-160',
          name: 'BlueCut Pro 1.60 High Index',
          description: 'Blocks 99% harmful blue light from monitors & UV400 radiation.',
          price: 1199,
          material: 'MR-8 High Index',
          index: '1.60',
          coating: 'Oleophobic Anti-Smudge & Blue Block',
          applicableTypes: ['single-vision', 'progressive']
        },
        {
          id: 'lens-crizal-easy-pro',
          name: 'Crizal Easy Pro 1.67 Ultra-Thin',
          description: 'Featherweight high-clarity lens with superior scratch & dust resistance.',
          price: 2499,
          material: 'Ultra High Index 1.67',
          index: '1.67',
          coating: 'Crizal Easy Pro Multi-Coating',
          applicableTypes: ['single-vision', 'progressive']
        },
        {
          id: 'lens-wide-arc-progressive',
          name: 'Wide-ARC Digital Progressive 1.60',
          description: 'Natural corridor transition from distance to near reading with no visible line.',
          price: 3499,
          material: 'Digital Freeform Polymer',
          index: '1.60',
          coating: 'Dual-Surface Anti-Glare + BlueGuard',
          applicableTypes: ['progressive']
        }
      ],
      prescriptionConfig: {
        allowManual: true,
        allowUpload: true,
        requireAddForProgressive: true,
        sphRange: { min: -10, max: 8, step: 0.25 },
        cylRange: { min: -4, max: 0, step: 0.25 },
        axisRange: { min: 1, max: 180, step: 1 },
        pdRange: { min: 50, max: 75, step: 1 }
      },
      frameSpecifications: product.specifications || {
        shape: product.frameShape || 'Round',
        frameType: product.frameType || 'Full Rim',
        material: product.material || 'Titanium',
        size: product.size || 'Medium'
      }
    };
  }

  // 2. Contact Lens Configuration
  let contactLensConfig = product.contactLensConfig;
  if (productType === 'contact-lens' && !contactLensConfig) {
    const isToric = (product.name || '').toLowerCase().includes('astigmatism') ||
                    (product.name || '').toLowerCase().includes('toric');
    const pieces = (product.name || '').includes('30') ? 30 : 6;

    contactLensConfig = {
      brand: product.brand || 'The Lens Hut Optics',
      manufacturer: 'Precision Optical Labs',
      material: 'Senofilcon A / Silicone Hydrogel',
      disposability: product.contactModality || 'Monthly',
      packSize: `${pieces} Pieces / Box`,
      piecesPerBox: pieces,
      baseCurve: '8.6 mm',
      diameter: '14.2 mm',
      waterContent: '38%',
      centralThickness: '0.08 mm',
      powerType: isToric ? 'toric' : 'spherical',
      allowSingleEye: true,
      prescriptionMethods: ['manual', 'upload', 'post-checkout'],
      powerOptions: {
        sphere: [
          -0.5, -0.75, -1.0, -1.25, -1.5, -1.75, -2.0, -2.25, -2.5, -2.75,
          -3.0, -3.25, -3.5, -3.75, -4.0, -4.25, -4.5, -4.75, -5.0, -5.5,
          -6.0, -6.5, -7.0, -7.5, -8.0, -8.5, -9.0,
          +0.5, +1.0, +1.5, +2.0, +2.5, +3.0, +3.5, +4.0
        ],
        cylinder: [-0.75, -1.25, -1.75, -2.25],
        axis: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180]
      },
      boxPricing: [
        { boxes: 1, price: product.price, label: '1 Box' },
        { boxes: 2, price: Math.round(product.price * 1.95), label: '2 Boxes (Save 5%)' },
        { boxes: 4, price: Math.round(product.price * 3.7), label: '4 Boxes (Save 10% - Best Value)' }
      ],
      keyBenefits: [
        'HydraClear technology sustains moisture for 16+ hours',
        'Class 1 UV blocking filters 99% UVB & 90% UVA',
        'Smooth surface resists protein deposits'
      ]
    };
  }

  // 3. Sunglasses Configuration
  let sunglassesConfig = product.sunglassesConfig;
  if (productType === 'sunglasses' && !sunglassesConfig) {
    sunglassesConfig = {
      sunglassMode: 'both', // Supports standard and power sunglasses
      lensTypes: [
        {
          id: 'sg-only',
          name: 'Sunglass Only',
          description: 'Non-corrective UV400 protective sun lenses',
          price: 0,
          polarized: false,
          uvProtection: 'UV400 Cat 3'
        },
        {
          id: 'sg-polarized',
          name: 'HD Polarized Tint',
          description: 'Neutralizes blinding road & water glare with superior optical depth',
          price: 999,
          polarized: true,
          uvProtection: '100% UV400'
        },
        {
          id: 'sg-photochromic',
          name: 'Photochromic Day-Night',
          description: 'Lenses adapt tint density automatically with ambient sunlight',
          price: 1699,
          polarized: false,
          uvProtection: '100% UV400'
        }
      ],
      frameSpecifications: product.specifications || {
        shape: product.frameShape || 'Aviator',
        frameType: product.frameType || 'Full Rim',
        material: product.material || 'Acetate & Metal',
        size: product.size || 'Medium'
      }
    };
  }

  return {
    ...product,
    productType,
    variants,
    eyeglassesConfig,
    contactLensConfig,
    sunglassesConfig
  };
}
