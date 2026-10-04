/**
 * Optical Pricing Calculator
 * Centralized, secure price calculation engine.
 * Never hardcodes prices; uses product and variant definitions.
 */

export function calculateItemPrice(product, configuration = {}, quantity = 1) {
  const pType = product.productType || 'eyeglasses';
  let unitBasePrice = Number(product.price || product.basePrice || 0);
  let variantPrice = 0;
  let lensPrice = 0;
  let optionPrice = 0;

  // 1. Variant price override or difference
  if (configuration.variantId && product.variants?.length > 0) {
    const selectedVariant = product.variants.find((v) => v.id === configuration.variantId);
    if (selectedVariant && selectedVariant.price !== undefined) {
      variantPrice = Number(selectedVariant.price);
      unitBasePrice = variantPrice; // Variant dictates base frame price
    }
  }

  // 2. Eyeglasses lens pricing
  if (pType === 'eyeglasses') {
    const lensType = configuration.lensSelection?.lensType;
    if (lensType && lensType !== 'frame-only') {
      const lensId = configuration.lensSelection?.lensId;
      const lensPkg = product.eyeglassesConfig?.availableLenses?.find((l) => l.id === lensId);
      if (lensPkg) {
        lensPrice = Number(lensPkg.price || 0);
      }
    }
  }

  // 3. Contact Lens pricing
  if (pType === 'contact-lens') {
    const boxes = Number(configuration.contactLens?.boxes || 1);
    let boxUnitPrice = Number(product.price || product.basePrice || 0);

    // Check volume box pricing tiers if defined
    if (product.contactLensConfig?.boxPricing?.length > 0) {
      const exactTier = product.contactLensConfig.boxPricing.find((t) => t.boxes === boxes);
      if (exactTier) {
        const tierTotal = Number(exactTier.price);
        return {
          basePrice: boxUnitPrice,
          variantPrice: 0,
          lensPrice: 0,
          optionPrice: 0,
          unitPrice: Math.round(tierTotal / boxes),
          totalPrice: tierTotal * quantity,
          boxes,
          tierApplied: true
        };
      }
    }

    // Default: boxUnitPrice * boxes
    const calculatedUnitPrice = boxUnitPrice * boxes;
    return {
      basePrice: boxUnitPrice,
      variantPrice: 0,
      lensPrice: 0,
      optionPrice: 0,
      unitPrice: calculatedUnitPrice,
      totalPrice: calculatedUnitPrice * quantity,
      boxes,
      tierApplied: false
    };
  }

  // 4. Sunglasses pricing
  if (pType === 'sunglasses') {
    const sgLensType = configuration.sunglass?.lensType;
    if (sgLensType && product.sunglassesConfig?.lensTypes?.length > 0) {
      const match = product.sunglassesConfig.lensTypes.find((l) => l.id === sgLensType);
      if (match) {
        optionPrice = Number(match.price || 0);
      }
    }

    if (configuration.sunglass?.mode === 'power') {
      const lensId = configuration.lensSelection?.lensId;
      const lensPkg = product.eyeglassesConfig?.availableLenses?.find((l) => l.id === lensId);
      if (lensPkg) {
        lensPrice = Number(lensPkg.price || 0);
      }
    }
  }

  const finalUnitPrice = unitBasePrice + lensPrice + optionPrice;
  const totalPrice = finalUnitPrice * quantity;

  return {
    basePrice: Number(product.price || product.basePrice || 0),
    variantPrice,
    lensPrice,
    optionPrice,
    unitPrice: finalUnitPrice,
    totalPrice
  };
}
