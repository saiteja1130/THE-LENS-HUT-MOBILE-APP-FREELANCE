/**
 * Optical Configuration Validation Engine
 * Validates optical selections client-side and server-side.
 */

export function validateConfiguration(product, configuration) {
  const errors = [];
  const pType = product.productType || 'eyeglasses';

  // 1. Variant validation (only for eyeglasses & sunglasses frames)
  if ((pType === 'eyeglasses' || pType === 'sunglasses') && product.variants?.length > 0) {
    if (!configuration.variantId) {
      errors.push('Please select a color/frame variant.');
    } else {
      const variant = product.variants.find((v) => v.id === configuration.variantId);
      if (!variant) {
        errors.push('Selected color variant is invalid.');
      } else if (variant.stock <= 0) {
        errors.push(`Selected variant (${variant.colorName}) is currently out of stock.`);
      }
    }
  }

  // 2. Eyeglasses Validation
  if (pType === 'eyeglasses') {
    const lensType = configuration.lensSelection?.lensType;
    if (!lensType) {
      errors.push('Please choose a lens type (Frame Only, Single Vision, or Progressive).');
      return { isValid: false, errors };
    }

    if (lensType !== 'frame-only') {
      if (!configuration.lensSelection?.lensId) {
        errors.push('Please select a lens package for your spectacles.');
      }

      const rxMethod = configuration.prescription?.method;
      if (!rxMethod) {
        errors.push('Please choose a prescription method (Enter Manually or Upload).');
      } else if (rxMethod === 'upload') {
        if (!configuration.prescription?.fileId && !configuration.prescription?.fileName && !configuration.prescription?.fileUrl) {
          errors.push('Please upload your prescription document (JPG, PNG, or PDF).');
        }
      } else if (rxMethod === 'manual') {
        const od = configuration.prescription?.od || {};
        const os = configuration.prescription?.os || {};

        if (!od.sph && !os.sph) {
          errors.push('Please enter a Sphere (SPH) value for at least one eye.');
        }

        // Validate OD Axis if CYL is present
        if (od.cyl && parseFloat(od.cyl) !== 0) {
          const axis = parseInt(od.axis, 10);
          if (isNaN(axis) || axis < 1 || axis > 180) {
            errors.push('Right eye (OD) Axis must be between 1° and 180° when Cylinder is provided.');
          }
        }

        // Validate OS Axis if CYL is present
        if (os.cyl && parseFloat(os.cyl) !== 0) {
          const axis = parseInt(os.axis, 10);
          if (isNaN(axis) || axis < 1 || axis > 180) {
            errors.push('Left eye (OS) Axis must be between 1° and 180° when Cylinder is provided.');
          }
        }

        // Progressive ADD requirement
        if (lensType === 'progressive') {
          if (!od.add && !os.add) {
            errors.push('Reading addition (ADD) is required for progressive lenses.');
          }
        }

        // PD validation
        if (configuration.prescription?.pd) {
          const pdNum = parseFloat(configuration.prescription.pd);
          if (isNaN(pdNum) || pdNum < 40 || pdNum > 80) {
            errors.push('Pupillary Distance (PD) should be between 40mm and 80mm.');
          }
        }
      }
    }
  }

  // 3. Contact Lens Validation
  if (pType === 'contact-lens') {
    const cl = configuration.contactLens;
    if (!cl) {
      errors.push('Contact lens configuration is missing.');
      return { isValid: false, errors };
    }

    if (!cl.boxes || cl.boxes < 1) {
      errors.push('Please select the number of boxes to order (at least 1 box).');
    }

    const rxMethod = cl.prescriptionMethod || 'manual';
    if (rxMethod === 'upload') {
      if (!cl.prescriptionFile?.fileId && !cl.prescriptionFile?.fileName) {
        errors.push('Please upload your contact lens prescription.');
      }
    } else if (rxMethod === 'manual') {
      const hasRight = cl.od?.sph && cl.od.sph !== '';
      const hasLeft = cl.os?.sph && cl.os.sph !== '';
      if (!hasRight && !hasLeft) {
        errors.push('Please select contact lens power for at least one eye.');
      }

      // Toric validation
      if (cl.powerType === 'toric') {
        if (hasRight) {
          if (!cl.od.cyl || !cl.od.axis) {
            errors.push('Right eye (OD) requires both Cylinder (CYL) and Axis for Toric lenses.');
          }
        }
        if (hasLeft) {
          if (!cl.os.cyl || !cl.os.axis) {
            errors.push('Left eye (OS) requires both Cylinder (CYL) and Axis for Toric lenses.');
          }
        }
      }
    }
  }

  // 4. Sunglasses Validation
  if (pType === 'sunglasses') {
    const sg = configuration.sunglass;
    if (!sg?.lensType) {
      errors.push('Please select a sunglass lens option.');
    }

    if (sg?.mode === 'power') {
      // Must validate prescription
      const rxMethod = configuration.prescription?.method;
      if (!rxMethod) {
        errors.push('Please choose a prescription method for power sunglasses.');
      } else if (rxMethod === 'manual') {
        const od = configuration.prescription?.od || {};
        const os = configuration.prescription?.os || {};
        if (!od.sph && !os.sph) {
          errors.push('Please enter a Sphere (SPH) value for power sunglasses.');
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
