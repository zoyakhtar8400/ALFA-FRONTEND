

export const resolveSmartItemUnit = (itemOrName, categoryName = '') => {
  if (!itemOrName) return 'Plate';

  let rawName = '';
  let explicitUnit = '';
  let rawCategory = String(categoryName || '');

  if (typeof itemOrName === 'string') {
    rawName = itemOrName;
  } else if (typeof itemOrName === 'object') {
    rawName = itemOrName.itemName || itemOrName.name || itemOrName.title || itemOrName.item_name || '';
    explicitUnit = (itemOrName.unit || itemOrName.unitName || itemOrName.unit_name || itemOrName.uom || '').trim();
    if (!rawCategory) {
      rawCategory = itemOrName.category || itemOrName.category_name || '';
    }
  }

  const name = rawName.toLowerCase().trim();
  const cat = rawCategory.toLowerCase().trim();

  // 1. If an explicit custom unit other than generic 'plate' was provided in DB, preserve it
  if (explicitUnit && explicitUnit.toLowerCase() !== 'plate') {
    return explicitUnit;
  }

  // 2. Coffee, Tea, Beverages, Drinks, Shakes, Juices, Ice Cream, Desserts -> "Pieces"
  const piecesKeywords = [
    'coffee', 'cold coffee', 'hot coffee', 'latte', 'cappuccino', 'espresso', 'mocha', 'frappe',
    'tea', 'chai', 'green tea', 'black tea',
    'shake', 'milkshake', 'smoothie', 'juice', 'mocktail', 'cocktail',
    'ice-cream', 'ice cream', 'sundae', 'falooda', 'kulfi', 'scoop',
    'beverage', 'drink', 'soda', 'coke', 'pepsi', 'sprite', 'water', 'bottle', 'can',
    'pastry', 'cake', 'brownie', 'muffin', 'dessert', 'sweet', 'gulab jamun', 'rasgulla',
    'burger', 'sandwich', 'roll', 'wrap', 'patties', 'samosa'
  ];
  if (
    piecesKeywords.some(kw => name.includes(kw)) ||
    cat.includes('coffee') || cat.includes('tea') || cat.includes('beverage') || cat.includes('drink') ||
    cat.includes('shake') || cat.includes('juice') || cat.includes('ice cream') || cat.includes('dessert')
  ) {
    return 'Pieces';
  }

  // 3. Rice, Biryani, Pulao, Khichdi, Fried Rice (checked before chicken/mutton so Chicken Biryani / Fried Rice stays Plate)
  const riceKeywords = ['rice', 'biryani', 'biryani', 'pulao', 'pulav', 'fried rice', 'khichdi', 'thali'];
  if (riceKeywords.some(kw => name.includes(kw)) || cat.includes('rice') || cat.includes('biryani')) {
    return 'Plate';
  }

  // 4. Butter Chicken, Chicken, Mutton, Fish, Meat, Prawn, Gravies, Curries -> "Kg"
  const kgKeywords = [
    'butter chicken', 'chicken butter masala', 'murgh makhani', 'kadhai chicken', 'kadai chicken',
    'chicken handi', 'handi chicken', 'chicken masala', 'chicken curry', 'chicken korma',
    'chicken do pyaza', 'chicken tikka masala', 'roast chicken', 'tandoori chicken',
    'butter mutton', 'mutton curry', 'mutton rogan josh', 'mutton korma', 'mutton handi', 'mutton masala',
    'chicken', 'mutton', 'fish curry', 'fish fry', 'prawn', 'prawns', 'keema', 'gosht', 'gravy'
  ];
  if (
    kgKeywords.some(kw => name.includes(kw)) ||
    cat.includes('gravy') || cat.includes('curry') || cat.includes('meat') || cat.includes('chicken') || cat.includes('mutton')
  ) {
    return 'Kg';
  }

  // 5. Default all other dishes, starters, breads, noodles to "Plate"
  return 'Plate';
};
