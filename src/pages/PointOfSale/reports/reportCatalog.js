import { FaChartBar, FaFileInvoice, FaUtensils, FaHistory, FaExchangeAlt } from 'react-icons/fa';

const generateSalesRegisterData = () => {
  const totalBills = 1245;
  const targetGross = 1845600;
  const targetDiscount = 24500;
  const targetTax = 218900;
  
  const data = [];
  
  let currentGross = 0;
  let currentDiscount = 0;
  let currentTax = 0;
  
  for (let i = 0; i < totalBills; i++) {
    const isLast = (i === totalBills - 1);
    
    let outlet = '';
    let billGross = 0;
    let billDiscount = 0;
    let billTax = 0;
    
    if (i === 10) {
      billGross = 120;
      billDiscount = 0;
      billTax = 0;
    } else if (i === 1200) {
      billGross = 16520;
      billDiscount = 20;
      billTax = 2000;
    } else if (i < 750) {
      outlet = 'Restaurant';
      if (i === 749) {
        billGross = 500000 - currentGross;
        billDiscount = 5000 - currentDiscount;
        billTax = 55000 - currentTax;
      } else {
        const factor = (i % 7) - 3;
        billGross = 660 + factor * 50;
        billDiscount = (i % 15 === 0 && currentDiscount < 5000) ? 100 : 0;
        billTax = Math.round((billGross - billDiscount) * 0.11);
      }
    } else if (i < 1100) {
      outlet = 'Bar';
      const segmentIndex = i - 750;
      if (i === 1099) {
        billGross = (500000 + 300000) - currentGross;
        billDiscount = (5000 + 3000) - currentDiscount;
        billTax = (55000 + 33000) - currentTax;
      } else {
        const factor = (segmentIndex % 5) - 2;
        billGross = 850 + factor * 80;
        billDiscount = (segmentIndex % 11 === 0 && currentDiscount < (5000 + 3000)) ? 100 : 0;
        billTax = Math.round((billGross - billDiscount) * 0.11);
      }
    } else {
      outlet = 'Banquet';
      const segmentIndex = i - 1100;
      if (isLast) {
        billGross = targetGross - currentGross;
        billDiscount = targetDiscount - currentDiscount;
        billTax = targetTax - currentTax;
      } else {
        const factor = (segmentIndex % 9) - 4;
        billGross = 7200 + factor * 500;
        billDiscount = (segmentIndex % 2 === 0 && currentDiscount < (targetDiscount - 500)) ? 200 : 0;
        billTax = Math.round((billGross - billDiscount) * 0.125);
      }
    }
    
    if (i !== 10 && i !== 1200) {
      if (i < 750) outlet = 'Restaurant';
      else if (i < 1100) outlet = 'Bar';
      else outlet = 'Banquet';
    } else {
      if (i === 10) outlet = 'Restaurant';
      if (i === 1200) outlet = 'Banquet';
    }
    
    currentGross += billGross;
    currentDiscount += billDiscount;
    currentTax += billTax;
    
    const billNet = billGross - billDiscount + billTax;
    
    const dayNum = Math.min(10, Math.floor(i / 125) + 1);
    const dateStr = `${String(dayNum).padStart(2, '0')}-Apr-2026`;
    
    const hour = 11 + ((i * 7) % 12);
    const min = (i * 13) % 60;
    const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    
    const billNo = String(1001 + i);
    const tableNum = (i % 25) + 1;
    const tableStr = tableNum < 20 ? `${String(tableNum).padStart(2, '0')}` : `Room ${100 + tableNum}`;
    
    const customerNames = ['Walk-In', 'John Doe', 'Jane Smith', 'R. Sharma', 'A. Khan', 'S. Patel', 'M. Gupta', 'Zoya Akhtar'];
    const customerStr = customerNames[i % customerNames.length];
    
    const paymentModes = ['Cash', 'Card', 'UPI', 'Credit', 'Other'];
    let paymentMode = '';
    if (i % 5 === 0) paymentMode = 'Cash';
    else if (i % 5 === 1) paymentMode = 'Card';
    else if (i % 5 === 2) paymentMode = 'UPI';
    else if (i % 5 === 3) paymentMode = 'Credit';
    else paymentMode = 'Other';
    
    const formatIndVal = (val) => {
      const parts = val.toFixed(2).split('.');
      let lastThree = parts[0].substring(parts[0].length - 3);
      const otherParts = parts[0].substring(0, parts[0].length - 3);
      if (otherParts !== '') {
        lastThree = ',' + lastThree;
      }
      const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
      return `₹ ${formattedInt}.${parts[1]}`;
    };
    
    data.push({
      c1: String(i + 1),
      c2: dateStr,
      c3: timeStr,
      c4: billNo,
      c5: tableStr,
      c6: customerStr,
      c7: paymentMode,
      c8: formatIndVal(billGross),
      c9: formatIndVal(billDiscount),
      c10: formatIndVal(billTax),
      c11: formatIndVal(billNet),
      rawGross: billGross,
      rawDiscount: billDiscount,
      rawTax: billTax,
      rawNet: billNet,
      outlet
    });
  }
  
  return data;
};

const generateItemwiseSaleData = () => {
  const items = [
    { name: 'HOT COFFEE', unit: 'CUP', ncQty: 0, qty: 10, value: 990.00, mainGrp: 'BEVERAGE', grp: 'BEVERAGE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'ICE BUCKET', unit: 'CUBE', ncQty: 0, qty: 10, value: 60.00, mainGrp: 'BEVERAGE', grp: 'BEVERAGE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'MINERAL WATER M', unit: 'Bottle', ncQty: 0, qty: 10, value: 300.00, mainGrp: 'BEVERAGE', grp: 'BEVERAGE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'MINERAL WATER SMART', unit: 'PEG', ncQty: 0, qty: 1, value: 90.00, mainGrp: 'BEVERAGE', grp: 'BEVERAGE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'TEA', unit: 'CUP', ncQty: 0, qty: 18, value: 1022.00, mainGrp: 'BEVERAGE', grp: 'BEVERAGE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'BUTTER NAAN', unit: 'PCS', ncQty: 0, qty: 2, value: 140.00, mainGrp: 'FOOD', grp: 'BREADS', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'TAWA ROTI', unit: 'PCS', ncQty: 0, qty: 7, value: 280.00, mainGrp: 'FOOD', grp: 'GHAR KA KHANA', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'CHICKEN DO PYAZA', unit: 'Bottle', ncQty: 0, qty: 1, value: 400.00, mainGrp: 'FOOD', grp: 'MAIN COURSE (NON-VEG)', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'TAPI CHICKEN CHILLY', unit: 'Plate', ncQty: 0, qty: 1, value: 370.00, mainGrp: 'FOOD', grp: 'MAIN COURSE (NON-VEG)', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'DAL MAKHANI', unit: 'PLATE', ncQty: 0, qty: 1, value: 380.00, mainGrp: 'FOOD', grp: 'MAIN COURSE (VEG)', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'HAKKA NOODLES CHICKEN', unit: 'PLATE', ncQty: 0, qty: 2, value: 540.00, mainGrp: 'FOOD', grp: 'MAIN COURSE (VEG)', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'HING DHANIYA KE CHATPATE', unit: 'Plate', ncQty: 0, qty: 1, value: 200.00, mainGrp: 'FOOD', grp: 'MAIN COURSE (VEG)', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'MATKA PANEER', unit: 'Plate', ncQty: 0, qty: 1, value: 380.00, mainGrp: 'FOOD', grp: 'MAIN COURSE (VEG)', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'VEG HAKKA NOODLE', unit: 'Plate', ncQty: 0, qty: 1, value: 280.00, mainGrp: 'FOOD', grp: 'MAIN COURSE (VEG)', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'VEG PAKORA', unit: 'Plate', ncQty: 0, qty: 4, value: 1076.00, mainGrp: 'FOOD', grp: 'PANTRY - VEG', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'CLASIC NON-VEG THALI', unit: 'Plate', ncQty: 0, qty: 2, value: 798.00, mainGrp: 'FOOD', grp: 'THALI\'S', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'CLASIC VEG THALI', unit: 'Plate', ncQty: 0, qty: 2, value: 698.00, mainGrp: 'FOOD', grp: 'THALI\'S', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'BUDWEISER BOTT', unit: 'Bottle', ncQty: 0, qty: 12, value: 2400.00, mainGrp: 'LIQUOR', grp: 'BEER', outlet: 'JAZZ BAR' },
    { name: 'CORONA BEER', unit: 'Bottle', ncQty: 0, qty: 8, value: 2080.00, mainGrp: 'LIQUOR', grp: 'BEER', outlet: 'JAZZ BAR' },
    { name: 'SMIRNOFF 60ML', unit: 'PEG', ncQty: 1, qty: 4, value: 680.00, mainGrp: 'LIQUOR', grp: 'VODKA', outlet: 'JAZZ BAR' }
  ];

  const formatIndVal = (val) => {
    const parts = val.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return `₹ ${formattedInt}.${parts[1]}`;
  };

  return items.map(item => ({
    c1: item.name,
    c2: item.unit,
    c3: String(item.ncQty),
    c4: String(item.qty),
    c5: formatIndVal(item.value),
    rawNCQty: item.ncQty,
    rawQty: item.qty,
    rawValue: item.value,
    mainGrp: item.mainGrp,
    grp: item.grp,
    outlet: item.outlet
  }));
};

const generateItemwiseCategorywiseSaleData = () => {
  const items = [
    { name: 'MINERAL WATER R', unit: 'Bottle', qty: 172, value: 5160.00, grp: 'BEVERAGE', mainGrp: 'FOOD', category: 'GST 0 %', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'MINERAL WATER', unit: 'Bottle', qty: 32, value: 960.00, grp: 'BEVERAGE', mainGrp: 'FOOD', category: 'GST 0 %', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'SOFT DRINK 200 ML', unit: 'Bottle', qty: 16, value: 480.00, grp: 'BEVERAGE', mainGrp: 'FOOD', category: 'GST 0 %', outlet: '1978 THE FAMILY RESTAURANT' },
    
    { name: 'MOJITO', unit: 'Glass', qty: 2, value: 300.00, grp: 'BEVERAGE', mainGrp: 'FOOD', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    
    { name: 'BEER ELEPHANT TOWER 3 L', unit: 'LITER', qty: 1, value: 1400.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'BUCKET BUD MILD (6 CAN)', unit: 'CAN', qty: 2, value: 2800.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'BUCKET BUDWEISER CAN 6', unit: 'CAN', qty: 12, value: 16800.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'BUCKET ELEPHANT CAN 6PC', unit: 'CAN', qty: 11, value: 15400.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'BUCKET TUBORG CAN 6PC', unit: 'CAN', qty: 1, value: 1150.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'BUDWEISER BOTTLE', unit: 'Bottle', qty: 5, value: 1000.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'BUDWEISER CAN', unit: 'CAN', qty: 145, value: 36500.20, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'BUDWEISER MILD CAN', unit: 'CAN', qty: 10, value: 2600.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'BUDWEISER 330 ML', unit: 'Bottle', qty: 4, value: 800.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'CORONA BEER', unit: 'Bottle', qty: 8, value: 2080.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'ELEPHANT CAN', unit: 'CAN', qty: 85, value: 16900.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'H/BUDWEISER CAN 5+1', unit: 'CAN', qty: 7, value: 9100.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'H/BUDWEISER MILD CAN 5+1', unit: 'CAN', qty: 1, value: 1300.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'H/ELEPHANT CAN 5+1', unit: 'CAN', qty: 7, value: 9100.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'H/K F ULTRA MAX CAN 5+1', unit: 'CAN', qty: 2, value: 2600.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'K F ULTRA LAGER 330 ML', unit: 'Bottle', qty: 1, value: 200.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'K F ULTRA MAX BOTTLE', unit: 'Bottle', qty: 48, value: 13920.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'K F ULTRA MAX CAN', unit: 'CAN', qty: 19, value: 4940.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'R ELEPHANT CAN 6 PC', unit: 'CAN', qty: 2, value: 3300.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'R S ELEPHANT CAN', unit: 'CAN', qty: 6, value: 1980.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'R S BUDWEISER CAN', unit: 'CAN', qty: 2, value: 680.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'TUBORG BOTTLE', unit: 'Bottle', qty: 25, value: 6750.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'TUBORG STRONG CAN', unit: 'CAN', qty: 14, value: 3640.00, grp: 'BEER', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    
    { name: 'BACARDI WHITE RUM 30 ML', unit: 'PEG', qty: 1, value: 100.00, grp: 'RUM', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' },
    { name: 'BACARDI WHITE RUM 60 ML', unit: 'PEG', qty: 5, value: 1140.00, grp: 'RUM', mainGrp: 'LIQUOR', category: 'TAX ON LIQUORE', outlet: '1978 THE FAMILY RESTAURANT' }
  ];

  const formatIndVal = (val) => {
    const parts = val.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return `${formattedInt}.${parts[1]}`;
  };

  return items.map(item => ({
    c1: item.name,
    c2: item.unit,
    c3: String(item.qty),
    c4: formatIndVal(item.value),
    rawQty: item.qty,
    rawValue: item.value,
    grp: item.grp,
    mainGrp: item.mainGrp,
    category: item.category,
    outlet: item.outlet
  }));
};

const generateTablewiseItemwiseSaleData = () => {
  const items = [
    { tblNo: '01', billNo: '1', time: '13:56', billAmt: 25700.00, name: 'BACARDI WHITE RUM 60 ML', qty: 4, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '3', time: '14:19', billAmt: 0, name: 'BACARDI WHITE RUM 60 ML', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '5', time: '18:08', billAmt: 0, name: 'BUDWEISER BOTTLE', qty: 2, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '6', time: '18:31', billAmt: 0, name: 'H/ELEPHANT CAN 5+1', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '10', time: '19:28', billAmt: 0, name: 'BUDWEISER CAN', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '10', time: '19:28', billAmt: 0, name: 'K.F ULTRA MAX BOTTLE', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '17', time: '22:31', billAmt: 0, name: 'BUDWEISER CAN', qty: 3, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '19', time: '22:52', billAmt: 0, name: 'BUDWEISER CAN', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '19', time: '22:52', billAmt: 0, name: 'ELEPHANT CAN', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '26', time: '21:41', billAmt: 0, name: 'K.F ULTRA MAX BOTTLE', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '26', time: '21:41', billAmt: 0, name: 'K.F ULTRA MAX CAN', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '32', time: '14:56', billAmt: 0, name: 'BUDWEISER CAN', qty: 3, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '34', time: '15:51', billAmt: 0, name: 'BUDWEISER CAN', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '35', time: '18:05', billAmt: 0, name: 'K.F ULTRA MAX CAN', qty: 4, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '49', time: '18:38', billAmt: 0, name: 'BUCKET BUDWEISER CAN 6PC', qty: 2, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '58', time: '21:42', billAmt: 0, name: 'BLACK DOG 30ML', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '58', time: '21:42', billAmt: 0, name: 'BLACK DOG 60ML', qty: 2, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '58', time: '21:42', billAmt: 0, name: 'ELEPHANT CAN', qty: 2, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '74', time: '18:05', billAmt: 0, name: 'K.F ULTRA MAX BOTTLE', qty: 2, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '82', time: '22:19', billAmt: 0, name: 'BUCKET BUDWEISER CAN 6PC', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '97', time: '21:54', billAmt: 0, name: 'BLENDER PRIDE 300 ML', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '113', time: '21:38', billAmt: 0, name: 'ELEPHANT CAN', qty: 4, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '116', time: '22:05', billAmt: 0, name: 'ELEPHANT CAN', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '119', time: '22:43', billAmt: 0, name: 'BUDWEISER CAN', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '120', time: '22:58', billAmt: 0, name: 'BLENDERS PRIDE 30ML', qty: 3, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '123', time: '18:01', billAmt: 0, name: 'K.F ULTRA MAX BOTTLE', qty: 2, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '126', time: '20:29', billAmt: 0, name: 'K.F ULTRA MAX BOTTLE', qty: 3, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '137', time: '22:04', billAmt: 0, name: 'BLENDERS PRIDE 60ML', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '151', time: '21:27', billAmt: 0, name: 'BUDWEISER CAN', qty: 5, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '163', time: '20:58', billAmt: 0, name: 'BUDWEISER CAN', qty: 3, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '187', time: '21:00', billAmt: 0, name: 'BUDWEISER CAN', qty: 2, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '187', time: '21:00', billAmt: 0, name: 'ELEPHANT CAN', qty: 2, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '188', time: '22:03', billAmt: 0, name: 'ELEPHANT CAN', qty: 3, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '197', time: '17:59', billAmt: 0, name: 'TUBORG STRONG CAN', qty: 3, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '204', time: '21:10', billAmt: 0, name: 'TUBORG BOTTLE', qty: 3, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '209', time: '23:20', billAmt: 0, name: 'BUCKET ELEPHANT CAN 6PC', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01', billNo: '210', time: '23:22', billAmt: 0, name: 'H/ELEPHANT CAN 5+1', qty: 1, outlet: 'JAZZ BAR' },
    { tblNo: '01 B', billNo: '118', time: '22:38', billAmt: 2220.00, name: 'BLENDERS PRIDE 30ML', qty: 3, outlet: 'JAZZ BAR' },
    { tblNo: '01 B', billNo: '118', time: '22:38', billAmt: 0, name: 'BUCKET ELEPHANT CAN 6PC', qty: 1, outlet: 'JAZZ BAR' }
  ];

  const formatIndVal = (val) => {
    if (val === 0) return '';
    const parts = val.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return `${formattedInt}.${parts[1]}`;
  };

  return items.map((item, idx) => ({
    c1: String(idx + 1), // Sr No
    c2: item.tblNo,
    c3: item.billNo,
    c4: item.time,
    c5: formatIndVal(item.billAmt),
    c6: item.name,
    c7: String(item.qty),
    rawAmt: item.billAmt,
    rawQty: item.qty,
    outlet: item.outlet
  }));
};

const generateCoverAnalysisData = () => {
  const items = [
    { date: '01/Apr/2026', billNo: '11', time: '19:54', pax: 1, amount: 260.00, user: 'JITENDRA', duration: '1 Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '13', time: '21:06', pax: 1, amount: 2925.00, user: 'JITENDRA', duration: '2 Hrs 57Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '15', time: '21:58', pax: 1, amount: 800.00, user: 'JITENDRA', duration: '16 Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '16', time: '22:02', pax: 1, amount: 1300.00, user: 'JITENDRA', duration: '0 Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '18', time: '22:49', pax: 1, amount: 550.00, user: 'JITENDRA', duration: '0 Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '20', time: '23:33', pax: 1, amount: 170.00, user: 'JITENDRA', duration: '0 Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' },
    { date: '02/Apr/2026', billNo: '21', time: '20:15', pax: 2, amount: 520.00, user: 'JITENDRA', duration: '1 Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' },
    { date: '02/Apr/2026', billNo: '31', time: '23:14', pax: 1, amount: 260.00, user: 'JITENDRA', duration: '0 Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' },
    { date: '03/Apr/2026', billNo: '35', time: '18:06', pax: 2, amount: 1040.00, user: 'JITENDRA', duration: '1 Hrs 24Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' },
    { date: '03/Apr/2026', billNo: '36', time: '18:07', pax: 1, amount: 510.00, user: 'JITENDRA', duration: '1 Hrs 19Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' },
    { date: '03/Apr/2026', billNo: '37', time: '18:25', pax: 2, amount: 520.00, user: 'JITENDRA', duration: '0 Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' },
    { date: '03/Apr/2026', billNo: '39', time: '20:14', pax: 1, amount: 780.00, user: 'JITENDRA', duration: '23 Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' },
    { date: '03/Apr/2026', billNo: '40', time: '20:27', pax: 1, amount: 1300.00, user: 'JITENDRA', duration: '0 Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' },
    { date: '03/Apr/2026', billNo: '43', time: '21:50', pax: 2, amount: 800.00, user: 'JITENDRA', duration: '1 Hrs 21Min', waiter: 'B.M PATEL', outlet: 'JAZZ BAR' }
  ];

  const formatIndVal = (val) => {
    const parts = val.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return `${formattedInt}.${parts[1]}`;
  };

  return items.map((item, idx) => {
    const avgAmt = item.amount / item.pax;
    return {
      c1: String(idx + 1), // Sr No
      c2: item.date,
      c3: item.billNo,
      c4: item.time,
      c5: String(item.pax),
      c6: formatIndVal(item.amount),
      c7: formatIndVal(avgAmt),
      c8: item.user,
      c9: item.duration,
      rawAmount: item.amount,
      rawPax: item.pax,
      waiter: item.waiter,
      outlet: item.outlet
    };
  });
};
const generateKitchenTimeGapData = () => {
  const items = [
    { date: '01/Apr/2026', billNo: '1', time: '13:56', item: 'BACARDI WHITE RUM 60 ML', qty: 4, type: 'Bill', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '2', time: '14:09', item: 'CORONA BEER', qty: 1, type: 'Bill', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '3', time: '14:19', item: 'BACARDI WHITE RUM 60 ML', qty: 1, type: 'Bill', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '4', time: '15:44', item: 'BUDWEISER BOTTLE', qty: 2, type: 'Bill', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '5', time: '18:08', item: 'BUDWEISER BOTTLE', qty: 2, type: 'Bill', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '6', time: '18:31', item: 'H/ELEPHANT CAN 5+1', qty: 1, type: 'Bill', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '7', time: '18:34', item: 'BUCKET ELEPHANT CAN 6PC', qty: 1, type: 'Bill', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '8', time: '18:41', item: 'ELEPHANT CAN', qty: 1, type: 'Bill', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '9', time: '19:05', item: 'BUCKET ELEPHANT CAN 6PC', qty: 1, type: 'Bill', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '10', time: '19:26', item: 'BUDWEISER CAN', qty: 1, type: 'Bill', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '10', time: '19:26', item: 'K.F ULTRA MAX BOTTLE', qty: 1, type: 'Bill', outlet: 'JAZZ BAR' }
  ];

  return items.map(item => ({
    c1: item.date,
    c2: item.billNo,
    c3: item.time,
    c4: item.item,
    c5: String(item.qty),
    c6: '', c7: '', c8: '', c9: '', c10: '', c11: '', c12: '', 
    rawQty: item.qty,
    type: item.type,
    outlet: item.outlet
  }));
};

const generateStewardwiseSaleData = () => {
  const items = [
    { item: 'SODA R', outlet: 'ROOM SERVICE', unit: 'Bottle', qty: 1.0, amount: 50.00, incentive: 0, totInc: 0, steward: 'B.M PATEL' },
    { item: 'HANDI MUTTON', outlet: 'ROOM SERVICE', unit: 'PLATE', qty: 3.0, amount: 1347.00, incentive: 0, totInc: 0, steward: 'B.M PATEL' },
    { item: 'EGG ONLET', outlet: 'ROOM SERVICE', unit: 'Plate', qty: 1.0, amount: 179.00, incentive: 0, totInc: 0, steward: 'B.M PATEL' },
    { item: 'CHICKEN FRIED RICE', outlet: 'ROOM SERVICE', unit: 'Plate', qty: 1.0, amount: 349.00, incentive: 0, totInc: 0, steward: 'B.M PATEL' },
    { item: 'PUDINA PARATHA', outlet: 'ROOM SERVICE', unit: 'PCS', qty: 2.0, amount: 120.00, incentive: 0, totInc: 0, steward: 'B.M PATEL' },
    { item: 'POHA', outlet: 'ROOM SERVICE', unit: 'Plate', qty: 1.0, amount: 179.00, incentive: 0, totInc: 0, steward: 'B.M PATEL' },
    { item: 'EGG CURRY 4 PCS', outlet: 'ROOM SERVICE', unit: 'Bottle', qty: 1.0, amount: 350.00, incentive: 0, totInc: 0.00, steward: 'B.M PATEL' },
    { item: 'MUTTON ROGANJOSH', outlet: 'ROOM SERVICE', unit: 'PLATE', qty: 1.0, amount: 449.00, incentive: 0, totInc: 0, steward: 'B.M PATEL' },
    { item: 'ALLOO MATAR', outlet: 'ROOM SERVICE', unit: 'Plate', qty: 1.0, amount: 259.00, incentive: 0, totInc: 0, steward: 'B.M PATEL' },
    
    { item: 'COLD COFFEE.', outlet: 'ROOM SERVICE', unit: 'Glass', qty: 4.0, amount: 796.00, incentive: 0, totInc: 0, steward: 'Bipin mishra' },
    { item: 'BUTTER ROTI', outlet: 'ROOM SERVICE', unit: 'PCS', qty: 10.0, amount: 650.00, incentive: 0, totInc: 0, steward: 'Bipin mishra' },
    { item: 'vegetable & cheese sandwich', outlet: 'ROOM SERVICE', unit: 'PCS', qty: 1.0, amount: 179.00, incentive: 0, totInc: 0.00, steward: 'Bipin mishra' }
  ];

  const formatIndVal = (val) => {
    const parts = val.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return `${formattedInt}.${parts[1]}`;
  };

  return items.map((item, idx) => {
    const incText = item.incentive === 0 ? '0' : String(item.incentive);
    const totIncText = item.totInc === 0 ? '0.00' : formatIndVal(item.totInc);
    return {
      c1: String(idx + 1), // Sr No
      c2: item.item,
      c3: item.outlet,
      c4: item.unit,
      c5: item.qty.toFixed(2),
      c6: formatIndVal(item.amount),
      c7: incText,
      c8: totIncText,
      rawQty: item.qty,
      rawAmount: item.amount,
      rawIncentive: item.incentive,
      rawTotInc: item.totInc,
      steward: item.steward
    };
  });
};

const generateTaxRegisterDetailedData = () => {
  const items = [
    { date: '1-Apr-26', billNo: '1', gross: 760.00, taxable: 0, nonTaxable: 760.00, discount: 0, net: 760.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '2', gross: 260.00, taxable: 0, nonTaxable: 260.00, discount: 0, net: 260.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '3', gross: 190.00, taxable: 0, nonTaxable: 190.00, discount: 0, net: 190.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '4', gross: 640.00, taxable: 0, nonTaxable: 640.00, discount: 0, net: 640.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '5', gross: 640.00, taxable: 0, nonTaxable: 640.00, discount: 0, net: 640.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '6', gross: 1300.00, taxable: 0, nonTaxable: 1300.00, discount: 0, net: 1300.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '7', gross: 1400.00, taxable: 0, nonTaxable: 1400.00, discount: 0, net: 1400.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '8', gross: 260.00, taxable: 0, nonTaxable: 260.00, discount: 0, net: 260.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '9', gross: 1400.00, taxable: 0, nonTaxable: 1400.00, discount: 0, net: 1400.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '10', gross: 550.00, taxable: 0, nonTaxable: 550.00, discount: 0, net: 550.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '11', gross: 260.00, taxable: 0, nonTaxable: 260.00, discount: 0, net: 260.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '12', gross: 360.00, taxable: 0, nonTaxable: 360.00, discount: 0, net: 360.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '13', gross: 2925.00, taxable: 0, nonTaxable: 2340.00, discount: 585.00, net: 2340.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '14', gross: 340.00, taxable: 0, nonTaxable: 340.00, discount: 0, net: 340.00, outlet: 'JAZZ BAR' },
    { date: '1-Apr-26', billNo: '15', gross: 800.00, taxable: 0, nonTaxable: 800.00, discount: 0, net: 800.00, outlet: 'JAZZ BAR' }
  ];

  const formatIndVal = (val) => {
    if (val === 0) return '';
    const parts = val.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return `${formattedInt}.${parts[1]}`;
  };

  return items.map(item => ({
    c1: item.date,
    c2: item.billNo,
    c3: formatIndVal(item.gross),
    c4: formatIndVal(item.taxable),
    c5: formatIndVal(item.nonTaxable),
    c6: formatIndVal(item.discount),
    c7: '', c8: '', c9: '', c10: '', c11: '', c12: '', c13: '', c14: '', c15: '', c16: '', c17: '', c18: '', c19: '', c20: '',
    c21: formatIndVal(item.net),
    rawGross: item.gross,
    rawTaxable: item.taxable,
    rawNonTaxable: item.nonTaxable,
    rawDiscount: item.discount,
    rawNet: item.net,
    outlet: item.outlet
  }));
};

const generateTaxSummaryDatewiseData = () => {
  const items = [
    { date: '01/Apr/2026', billNo: '1-20', gross: 15405.00, taxable: 0, nonTaxable: 14820.00, discount: 585.00, sgst: 0, cgst: 0, roundOff: 0, net: 14820.00, outlet: 'JAZZ BAR' },
    { date: '02/Apr/2026', billNo: '21-31', gross: 10810.00, taxable: 0, nonTaxable: 10550.00, discount: 260.00, sgst: 0, cgst: 0, roundOff: 0, net: 10550.00, outlet: 'JAZZ BAR' },
    { date: '03/Apr/2026', billNo: '32-46', gross: 12025.00, taxable: 0, nonTaxable: 11570.00, discount: 455.00, sgst: 0, cgst: 0, roundOff: 0, net: 11570.00, outlet: 'JAZZ BAR' },
    
    { date: '01/Apr/2026', billNo: '1-13', gross: 4067.00, taxable: 3892.00, nonTaxable: 60.00, discount: 115.00, sgst: 97.29, cgst: 97.29, roundOff: 2.42, net: 4149.00, outlet: 'JAZZ BAR RESTAURANT' },
    { date: '02/Apr/2026', billNo: '14-20', gross: 2839.00, taxable: 2522.65, nonTaxable: 30.00, discount: 286.35, sgst: 63.07, cgst: 63.07, roundOff: 2.21, net: 2651.00, outlet: 'JAZZ BAR RESTAURANT' },
    
    { date: '01/Apr/2026', billNo: '1-7', gross: 877.00, taxable: 787.00, nonTaxable: 90.00, discount: 0, sgst: 19.68, cgst: 19.68, roundOff: -0.36, net: 916.00, outlet: 'ROOM SERVICE' }
  ];

  const formatIndVal = (val) => {
    if (val === 0) return '';
    const parts = val.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return `${formattedInt}.${parts[1]}`;
  };

  const formatRound = (val) => {
    if (val === 0) return '';
    return val.toFixed(2);
  };

  return items.map(item => ({
    c1: item.date,
    c2: item.billNo,
    c3: formatIndVal(item.gross),
    c4: formatIndVal(item.taxable),
    c5: formatIndVal(item.nonTaxable),
    c6: formatIndVal(item.discount),
    c7: formatIndVal(item.sgst),
    c8: formatIndVal(item.cgst),
    c9: '', c10: '', c11: '', c12: '', c13: '', c14: '',
    c15: formatRound(item.roundOff),
    c16: formatIndVal(item.net),
    rawGross: item.gross,
    rawTaxable: item.taxable,
    rawNonTaxable: item.nonTaxable,
    rawDiscount: item.discount,
    rawSgst: item.sgst,
    rawCgst: item.cgst,
    rawRoundOff: item.roundOff,
    rawNet: item.net,
    outlet: item.outlet
  }));
};

const generateKOTRegisterData = () => {
  const items = [
    { date: '03/Apr/2026', kotNo: '1', billNo: '', time: '', steward: 'Bipin mishra', table: 'NC', item: 'CHICKEN DO PYAZA', qty: 1.000, rate: 400.00, amount: 400.00, voided: 'No', reason: '', ncKot: 'Yes', remarks: 'rajesh all by md sir', user: 'HIMANSHU', outlet: '1978 THE FAMILY RESTAURANT' },
    { date: '04/Apr/2026', kotNo: '2', billNo: '', time: '', steward: 'HARSHIT', table: '', item: 'TEA', qty: 6.000, rate: 89.00, amount: 534.00, voided: 'No', reason: '', ncKot: 'Yes', remarks: 'MD SIR', user: 'HIMANSHU', outlet: '1978 THE FAMILY RESTAURANT' },
    { date: '04/Apr/2026', kotNo: '2', billNo: '', time: '', steward: 'HARSHIT', table: '', item: 'VEG PAKORA', qty: 2.000, rate: 269.00, amount: 538.00, voided: 'No', reason: '', ncKot: 'Yes', remarks: 'MD SIR', user: 'HIMANSHU', outlet: '1978 THE FAMILY RESTAURANT' },
    { date: '05/Apr/2026', kotNo: '3', billNo: '', time: '', steward: 'HARSHIT', table: '', item: 'TEA', qty: 1.000, rate: 89.00, amount: 89.00, voided: 'No', reason: '', ncKot: 'Yes', remarks: 'rajesh uncle', user: 'HIMANSHU', outlet: '1978 THE FAMILY RESTAURANT' },
    { date: '07/Apr/2026', kotNo: '4', billNo: '', time: '', steward: 'Bipin mishra', table: '', item: 'HAKKA NOODLES CHICKEN', qty: 2.000, rate: 270.00, amount: 540.00, voided: 'No', reason: '', ncKot: 'Yes', remarks: 'by md sir', user: 'HIMANSHU', outlet: '1978 THE FAMILY RESTAURANT' },
    { date: '07/Apr/2026', kotNo: '4', billNo: '', time: '', steward: 'Bipin mishra', table: '', item: 'TAPI CHICKEN CHILLY', qty: 1.000, rate: 370.00, amount: 370.00, voided: 'No', reason: '', ncKot: 'Yes', remarks: 'by md sir', user: 'HIMANSHU', outlet: '1978 THE FAMILY RESTAURANT' },
    { date: '08/Apr/2026', kotNo: '5', billNo: '', time: '', steward: 'B.M PATEL', table: '', item: 'MINERAL WATER M', qty: 3.000, rate: 30.00, amount: 90.00, voided: 'No', reason: '', ncKot: 'Yes', remarks: 'MD SIR', user: 'HIMANSHU', outlet: '1978 THE FAMILY RESTAURANT' },
    { date: '08/Apr/2026', kotNo: '5', billNo: '', time: '', steward: 'Bipin mishra', table: '', item: 'TEA', qty: 1.000, rate: 89.00, amount: 89.00, voided: 'No', reason: '', ncKot: 'Yes', remarks: '', user: 'HIMANSHU', outlet: '1978 THE FAMILY RESTAURANT' },
    
    { date: '01/Apr/2026', kotNo: '1', billNo: '1', time: '', steward: 'PRASHANT', table: '01', item: 'BACARDI WHITE RUM 60 ML', qty: 3.000, rate: 190.00, amount: 570.00, voided: 'No', reason: '', ncKot: 'No', remarks: '', user: 'JITENDRA', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', kotNo: '2', billNo: '1', time: '', steward: 'PRASHANT', table: '01', item: 'BACARDI WHITE RUM 60 ML', qty: 1.000, rate: 190.00, amount: 190.00, voided: 'No', reason: '', ncKot: 'No', remarks: '', user: 'JITENDRA', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', kotNo: '3', billNo: '2', time: '', steward: 'PRASHANT', table: '01', item: 'CORONA BEER', qty: 1.000, rate: 280.00, amount: 280.00, voided: 'No', reason: '', ncKot: 'No', remarks: '', user: 'JITENDRA', outlet: 'JAZZ BAR' }
  ];

  const formatIndVal = (val) => {
    if (val === 0) return '';
    const parts = val.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return `${formattedInt}.${parts[1]}`;
  };

  return items.map(item => ({
    c1: item.date,
    c2: item.kotNo,
    c3: item.billNo,
    c4: item.time,
    c5: item.steward,
    c6: item.table,
    c7: item.item,
    c8: item.qty.toFixed(3),
    c9: formatIndVal(item.rate),
    c10: formatIndVal(item.amount),
    c11: item.voided,
    c12: item.reason,
    c13: item.ncKot,
    c14: item.remarks,
    c15: item.user,
    rawQty: item.qty,
    rawRate: item.rate,
    rawAmount: item.amount,
    outlet: item.outlet
  }));
};

const generateNCKOTData = () => {
  const items = [
    { sNo: '1', kotNo: '1', table: 'NC', date: '03/Apr/2026', item: 'CHICKEN DO PYAZA', remarks: 'rajesh all by md s', custRemarks: '', qty: 1.000, rate: 400.00, amount: 400.00, ncType: 'Complementry (0.00%)', outlet: '1978 THE FAMILY RESTAURANT' },
    { sNo: '2', kotNo: '2', table: 'NC', date: '04/Apr/2026', item: 'VEG PAKORA', remarks: 'MD SIR', custRemarks: '', qty: 2.000, rate: 269.00, amount: 538.00, ncType: 'Complementry (0.00%)', outlet: '1978 THE FAMILY RESTAURANT' },
    { sNo: '2', kotNo: '2', table: 'NC', date: '04/Apr/2026', item: 'TEA', remarks: 'MD SIR', custRemarks: '', qty: 6.000, rate: 89.00, amount: 534.00, ncType: 'Complementry (0.00%)', outlet: '1978 THE FAMILY RESTAURANT' },
    { sNo: '3', kotNo: '3', table: 'NC', date: '05/Apr/2026', item: 'TEA', remarks: 'rajesh uncle', custRemarks: '', qty: 1.000, rate: 89.00, amount: 89.00, ncType: 'Complementry (0.00%)', outlet: '1978 THE FAMILY RESTAURANT' },
    { sNo: '4', kotNo: '4', table: 'NC', date: '07/Apr/2026', item: 'HAKKA NOODLES CHICKEN', remarks: 'by md sir', custRemarks: '', qty: 2.000, rate: 270.00, amount: 540.00, ncType: 'Complementry (0.00%)', outlet: '1978 THE FAMILY RESTAURANT' },
    { sNo: '4', kotNo: '4', table: 'NC', date: '07/Apr/2026', item: 'TAPI CHICKEN CHILLY', remarks: 'by md sir', custRemarks: '', qty: 1.000, rate: 370.00, amount: 370.00, ncType: 'Complementry (0.00%)', outlet: '1978 THE FAMILY RESTAURANT' },
    { sNo: '5', kotNo: '5', table: 'NC', date: '08/Apr/2026', item: 'MINERAL WATER M', remarks: 'MD SIR', custRemarks: '', qty: 3.000, rate: 30.00, amount: 90.00, ncType: 'Complementry (0.00%)', outlet: '1978 THE FAMILY RESTAURANT' },
    { sNo: '6', kotNo: '6', table: 'NC', date: '08/Apr/2026', item: 'TEA', remarks: '', custRemarks: '', qty: 1.000, rate: 89.00, amount: 89.00, ncType: 'Complementry (0.00%)', outlet: '1978 THE FAMILY RESTAURANT' }
  ];

  const formatIndVal = (val) => {
    if (val === 0) return '';
    const parts = val.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return `${formattedInt}.${parts[1]}`;
  };

  return items.map(item => ({
    c1: item.sNo,
    c2: item.kotNo,
    c3: item.table,
    c4: item.date,
    c5: item.item,
    c6: item.remarks,
    c7: item.custRemarks,
    c8: item.qty.toFixed(3),
    c9: formatIndVal(item.rate),
    c10: formatIndVal(item.amount),
    rawQty: item.qty,
    rawRate: item.rate,
    rawAmount: item.amount,
    ncType: item.ncType,
    outlet: item.outlet
  }));
};

const generatePendingKOTData = () => {
  const items = [
    { date: '15/Jul/2026', kotNo: '4367', time: '19:00', steward: 'GOLU', table: '06', item: 'BUDWEISER MILD BOTTLE', qty: 1.000, rate: 260.00, amount: 260.00, user: 'SA', outlet: 'JAZZ BAR' },
    { date: '12/Jul/2026', kotNo: '3074', time: '13:14', steward: 'PRASHANT', table: '06', item: 'PANEER CHILLI HALF 6 PC', qty: 1.000, rate: 190.00, amount: 190.00, user: 'JITENDRA', outlet: 'JAZZ BAR RESTAURANT' }
  ];

  const formatIndVal = (val) => {
    if (val === 0) return '';
    const parts = val.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return `${formattedInt}.${parts[1]}`;
  };

  return items.map(item => ({
    c1: item.date,
    c2: item.kotNo,
    c3: item.time,
    c4: item.steward,
    c5: item.table,
    c6: item.item,
    c7: item.qty.toFixed(3),
    c8: formatIndVal(item.rate),
    c9: formatIndVal(item.amount),
    c10: item.user,
    rawQty: item.qty,
    rawRate: item.rate,
    rawAmount: item.amount,
    outlet: item.outlet
  }));
};

const generateCashierSettlementDetailedData = () => {
  const items = [
    { date: '01/Apr/2026', billNo: '1', amount: 760.00, dateShort: '1-Apr-26', payType: 'Cash In Hand', grcNo: '', partyName: '', paidAmount: 760.00, user: 'JITENDRA', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '2', amount: 260.00, dateShort: '1-Apr-26', payType: 'Cash In Hand', grcNo: '', partyName: '', paidAmount: 260.00, user: 'JITENDRA', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '3', amount: 190.00, dateShort: '1-Apr-26', payType: 'Cash In Hand', grcNo: '', partyName: '', paidAmount: 190.00, user: 'JITENDRA', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '4', amount: 640.00, dateShort: '1-Apr-26', payType: 'Cash In Hand', grcNo: '', partyName: '', paidAmount: 640.00, user: 'JITENDRA', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '5', amount: 640.00, dateShort: '1-Apr-26', payType: 'Cash In Hand', grcNo: '', partyName: '', paidAmount: 640.00, user: 'JITENDRA', outlet: 'JAZZ BAR' },
    { date: '01/Apr/2026', billNo: '6', amount: 1300.00, dateShort: '1-Apr-26', payType: 'Cash In Hand', grcNo: '', partyName: '', paidAmount: 1300.00, user: 'JITENDRA', outlet: 'JAZZ BAR' }
  ];

  const formatIndVal = (val) => {
    if (val === 0) return '';
    const parts = val.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return `${formattedInt}.${parts[1]}`;
  };

  return items.map((item, idx) => ({
    c1: String(idx + 1),
    c2: item.date,
    c3: item.billNo,
    c4: formatIndVal(item.amount),
    c5: item.dateShort,
    c6: item.payType,
    c7: item.grcNo,
    c8: item.partyName,
    c9: formatIndVal(item.paidAmount),
    c10: item.user,
    rawAmount: item.amount,
    rawPaid: item.paidAmount,
    outlet: item.outlet
  }));
};

const generateUserwiseCollectionData = () => {
  const items = [
    { userName: 'JITENDRA', billAmt: 214147.00, cashInHand: 214147.00, roomSettlement: 0, netCash: 214147.00, outlet: 'JAZZ BAR' },
    { userName: 'JITENDRA', billAmt: 73776.00, cashInHand: 73776.00, roomSettlement: 0, netCash: 73776.00, outlet: 'JAZZ BAR RESTAURANT' },
    { userName: 'D.K', billAmt: 1529.00, cashInHand: 0, roomSettlement: 1529.00, netCash: 0, outlet: 'ROOM SERVICE' },
    { userName: 'HIMANSHU', billAmt: 58522.00, cashInHand: 0, roomSettlement: 58522.00, netCash: 0, outlet: 'ROOM SERVICE' },
    { userName: 'HOTEL', billAmt: 655.00, cashInHand: 0, roomSettlement: 655.00, netCash: 0, outlet: 'ROOM SERVICE' },
    { userName: 'RAMESH', billAmt: 29615.00, cashInHand: 0, roomSettlement: 29615.00, netCash: 0, outlet: 'ROOM SERVICE' }
  ];

  const formatIndVal = (val) => {
    if (val === 0) return '';
    const parts = val.toFixed(2).split('.');
    let lastThree = parts[0].substring(parts[0].length - 3);
    const otherParts = parts[0].substring(0, parts[0].length - 3);
    if (otherParts !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    return `${formattedInt}.${parts[1]}`;
  };

  return items.map(item => ({
    c1: item.userName,
    c2: formatIndVal(item.billAmt),
    c3: formatIndVal(item.cashInHand),
    c4: formatIndVal(item.roomSettlement),
    c5: formatIndVal(item.netCash),
    rawBill: item.billAmt,
    rawCash: item.cashInHand,
    rawRoom: item.roomSettlement,
    rawNet: item.netCash,
    outlet: item.outlet
  }));
};

const generateCustomerInfoData = () => [
  { c1: 'John Doe', c2: '+91 99887 76655', c3: 'VIP Guest', c4: '14', c5: '12-Jul-2026' },
  { c1: 'Sarah Connor', c2: '+91 99999 88888', c3: 'Regular', c4: '6', c5: '14-Jul-2026' },
  { c1: 'Alice Smith', c2: '+91 98765 43210', c3: 'Loyalty Member', c4: '22', c5: '15-Jul-2026' },
  { c1: 'Bob Johnson', c2: '+91 91234 56789', c3: 'VIP Guest', c4: '18', c5: '10-Jul-2026' }
];

const generateCustomerOutletVisitData = () => [
  { c1: 'John Doe', c2: '+91 99887 76655', c3: '10', c4: '4', c5: '0' },
  { c1: 'Sarah Connor', c2: '+91 99999 88888', c3: '3', c4: '0', c5: '3' },
  { c1: 'Alice Smith', c2: '+91 98765 43210', c3: '15', c4: '5', c5: '2' },
  { c1: 'Bob Johnson', c2: '+91 91234 56789', c3: '12', c4: '6', c5: '0' }
];

export const REPORT_CATALOG = [
  {
    id: 'sales-report',
    title: 'Sales Report',
    subtitle: 'Revenue register and sales analysis',
    icon: FaChartBar,
    color: '#0D9488', // Teal
    gradient: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
    bgLight: 'rgba(13, 148, 136, 0.04)',
    reports: [
      { 
        id: 'sales-register', 
        name: 'Sales Register', 
        desc: 'Chronological ledger of POS orders, covers count, and totals.',
        kpis: [
          { label: 'Total Bills', value: '1,245' },
          { label: 'Gross Sale', value: '₹ 18,45,600.00' },
          { label: 'Discount', value: '₹ 24,500.00' },
          { label: 'Tax Collection', value: '₹ 2,18,900.00' },
          { label: 'Net Sale', value: '₹ 20,40,000.00' },
          { label: 'Average Bill Value', value: '₹ 1,640.00' }
        ],
        columns: ['Sr No', 'Date', 'Time', 'Bill No', 'Table', 'Customer', 'Payment Mode', 'Gross Amount', 'Discount', 'Tax', 'Net Amount'],
        data: generateSalesRegisterData()
      },
      { 
        id: 'itemwise-sale', 
        name: 'Itemwise Sale', 
        desc: 'Itemized sales quantities and margins analysis.',
        kpis: [ { label: 'Top Item', value: 'BUDWEISER BOTT' }, { label: 'Total Sales', value: '₹ 13,164.00' } ],
        columns: ['Item Name', 'Unit', 'NC Qty', 'Qty', 'Value'],
        data: generateItemwiseSaleData()
      },
      { 
        id: 'itemwise-outletwise-sale', 
        name: 'Itemwise Outletwise Sale', 
        desc: 'Breakdown of item sales per individual outlet.',
        kpis: [ { label: 'Busiest Outlet', value: '1978 THE FAMILY RESTAURANT' }, { label: 'Total Sales', value: '₹ 13,164.00' } ],
        columns: ['Item Name', 'Unit', 'NC Qty', 'Qty', 'Value'],
        data: generateItemwiseSaleData()
      },
      { 
        id: 'itemwise-categorywise-sale', 
        name: 'Itemwise Categorywise Sale', 
        desc: 'Breakdown of item sales per item categories (Veg, Non-Veg, Beverage).',
        kpis: [ { label: 'Top Category', value: 'TAX ON LIQUORE' }, { label: 'Total Sales', value: '₹ 1,68,790.20' } ],
        columns: ['Item Name', 'Unit', 'Qty', 'Value'],
        data: generateItemwiseCategorywiseSaleData()
      },
      { 
        id: 'tablewise-sale', 
        name: 'Tablewise Itemwise Sale', 
        desc: 'Review revenue generation performance across restaurant tables and bills.',
        kpis: [ { label: 'Top Outlet', value: 'JAZZ BAR' }, { label: 'Busiest Table', value: '01' } ],
        columns: ['S.No.', 'Tbl No./Rm No.', 'Bill No.', 'Time', 'Bill Amt.', 'Name', 'Qty.', 'Value'],
        data: generateTablewiseItemwiseSaleData()
      },
      { 
        id: 'cover-analysis', 
        name: 'Cover Analysis Report', 
        desc: 'Pax cover count, average order values, and table service turnaround times.',
        kpis: [ { label: 'Total Pax Served', value: '19 Pax' }, { label: 'Avg Bill / Pax', value: '₹ 802.10' } ],
        columns: ['S.No.', 'Bill Date', 'Bill No.', 'Time', 'No. of Pax', 'Bill Amount', 'Avg. Amt.', 'User Name', 'Duration'],
        data: generateCoverAnalysisData()
      },
      { 
        id: 'kitchen-time-gap', 
        name: 'Kitchen Time Gap Report', 
        desc: 'Time interval between KOT print and final kitchen preparation delivery.',
        kpis: [ { label: 'Total Orders', value: '11 Bills' } ],
        columns: ['Ord./Bill Date', 'Ord./Bill No.', 'Ord./Bill Time (A)', 'Item Name', 'Qty', 'Ord. Complete Date', 'Ord. Complete Time (B)', 'Diff. (B-A)', 'Bill No.', 'Bill Date', 'Bill Time (C)', 'Diff. (C-A)'],
        data: generateKitchenTimeGapData()
      },
      { 
        id: 'stewardwise-sale', 
        name: 'Stewardwise Item Sale', 
        desc: 'Detailed item sales analysis per steward / waiter.',
        kpis: [ { label: 'Top Steward', value: 'B.M PATEL' }, { label: 'Steward Sales', value: '₹ 14,009.40' } ],
        columns: ['S.No.', 'Item', 'Outlet', 'Unit', 'Qty', 'Amount', 'Incentive', 'Tot Inc.'],
        data: generateStewardwiseSaleData()
      },
      { 
        id: 'flash-report', 
        name: 'Flash Report', 
        desc: 'Summarized operational metrics comparison checklist.',
        kpis: [ { label: 'Gross Margin', value: '68%' } ],
        columns: ['Metric', 'Today', 'Target', 'Variance'],
        data: [
          { c1: 'Gross Revenue', c2: '₹12,450', c3: '₹15,000', c4: '-17%' },
          { c1: 'Covers Count', c2: '107 Covers', c3: '100 Covers', c4: '+7%' }
        ]
      }
    ]
  },
  {
    id: 'tax-report',
    title: 'Tax Report',
    subtitle: 'Taxation ledgers and summaries',
    icon: FaFileInvoice,
    color: '#3B82F6', // Blue
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    bgLight: 'rgba(59, 130, 246, 0.04)',
    reports: [
      { 
        id: 'tax-datawise-summary', 
        name: 'Tax Register (Detailed)', 
        desc: 'Detailed ledger of transaction tax collections (CGST, SGST, IGST, VAT).',
        kpis: [ { label: 'Total Gross Sales', value: '₹ 15,225.00' }, { label: 'Net Sales', value: '₹ 14,640.00' } ],
        columns: [
          'BILL DATE', 'BILL No.', 'GROSS AMT.', 'TAXABLE AMT.', 'NON-TAXABLE AMT.', 'DISCOUNT', 
          'CGST 2.5%', 'SGST 2.5%', 'CGST 6.0%', 'SGST 6.0%', 'CGST 9.0%', 'SGST 9.0%', 
          'CGST 14.0%', 'SGST 14.0%', 'IGST', 'CESS', 'VAT', 'Add. Amt.', 'SERVICE CHARGE', 'ROUND OFF', 'NET AMOUNT'
        ],
        data: generateTaxRegisterDetailedData()
      },
      { 
        id: 'taxwise-summary', 
        name: 'Tax Summary Datewise', 
        desc: 'Daily summaries of transaction tax collections (CGST, SGST, IGST, VAT).',
        kpis: [ { label: 'Total Tax SGST', value: '₹ 1,721.67' }, { label: 'Total Tax CGST', value: '₹ 1,721.67' } ],
        columns: [
          'DATE', 'BILL No.', 'GROSS AMT.', 'TAXABLE AMT.', 'NON TAXABLE AMT.', 'DISCOUNT', 
          'SGST', 'CGST', 'IGST', 'CESS', 'VAT', 'SERVICE CHARGE', 'S.C(SGST)', 'S.C(CGST)', 'ROUND OFF', 'NET AMOUNT'
        ],
        data: generateTaxSummaryDatewiseData()
      }
    ]
  },
  {
    id: 'kot-report',
    title: 'KOT Report',
    subtitle: 'Kitchen logs and pending orders',
    icon: FaUtensils,
    color: '#8B5CF6', // Purple
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    bgLight: 'rgba(139, 92, 246, 0.04)',
    reports: [
      { 
        id: 'kot-register', 
        name: 'KOT Register', 
        desc: 'General log of kitchen order tickets issued.',
        kpis: [ { label: 'Total KOT Amount', value: '₹ 8,574.00' } ],
        columns: [
          'Date', 'KOT No.', 'Bill No.', 'Time', 'Steward', 'Table No.', 'Item', 'Qty.', 'Rate', 'Amount', 'Void', 'Reason', 'NC KOT', 'Remarks', 'User'
        ],
        data: generateKOTRegisterData()
      },
      { 
        id: 'nc-kot', 
        name: 'NC KOT(Bill Report)(Detailed)', 
        desc: 'NC (Non-Chargeable / Complimentary) KOT details per outlet and date.',
        kpis: [ { label: 'Total NC Amount', value: '₹ 2,726.00' } ],
        columns: ['S.No.', 'KOT/Bill No.', 'Table/Room', 'Date', 'Item', 'Remarks', 'Cust. Remarks', 'Qty.', 'Rate', 'Amount'],
        data: generateNCKOTData()
      },
      { 
        id: 'pending-kot-report', 
        name: 'Pending KOT Report', 
        desc: 'Currently active or delayed KOT orders not yet served.',
        kpis: [ { label: 'Total Pending Amount', value: '₹ 450.00' } ],
        columns: ['Date', 'KOT No.', 'Time', 'Steward', 'Table No.', 'Item', 'Qty.', 'Rate', 'Amount', 'User'],
        data: generatePendingKOTData()
      }
    ]
  },
  {
    id: 'cashier-settlement',
    title: 'Cashier Settlement',
    subtitle: 'Shift receipts and collection history',
    icon: FaHistory,
    color: '#EF4444', // Red
    gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
    bgLight: 'rgba(239, 68, 68, 0.04)',
    reports: [
      { 
        id: 'cashier-settlement-summarized', 
        name: 'Cashier Settlement Report(Detailed)', 
        desc: 'Cashier end-of-shift receipts collection detail register.',
        kpis: [ { label: 'Total Settled Amount', value: '₹ 3,790.00' } ],
        columns: ['S.No.', 'Bill Date', 'Bill No.', 'Bill Amount', 'Date', 'Pay Type', 'GRCNo', 'Party Name', 'Paid Amount', 'user Name'],
        data: generateCashierSettlementDetailedData()
      },
      { 
        id: 'userwise-collection-report', 
        name: 'User Wise Collection Report(Summary)', 
        desc: 'Receipt collections categorized by active POS User profile.',
        kpis: [ { label: 'Grand Total Cash', value: '₹ 2,87,923.00' } ],
        columns: ['USER NAME', 'BILL AMT.', 'Cash In Hand', 'ROOM SETTLEMENT', 'NET CASH'],
        data: generateUserwiseCollectionData()
      }
    ]
  },
  {
    id: 'customer-report',
    title: 'Customer Report',
    subtitle: 'Customer visits and demographic details',
    icon: FaExchangeAlt,
    color: '#EC4899', // Pink
    gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
    bgLight: 'rgba(236, 72, 153, 0.04)',
    reports: [
      { 
        id: 'customer-info-report', 
        name: 'Customer Info Report', 
        desc: 'Guest loyalty registers, mobile contacts, and VIP tags database.',
        kpis: [ { label: 'Total Registered Guests', value: '4 Customers' } ],
        columns: ['Customer Name', 'Mobile', 'Type', 'Visits Count', 'Last Visit'],
        data: generateCustomerInfoData()
      },
      { 
        id: 'customer-outlet-visit-report', 
        name: 'Customer Outlet Visit Report', 
        desc: 'Track frequency of guest visits across specific outlets (Cafe, Restaurant, Bar).',
        kpis: [ { label: 'Most Visited Outlet', value: 'Main Restaurant' } ],
        columns: ['Customer Name', 'Mobile', 'Main Restaurant', 'Bar Outlet', 'Cafe Outlet'],
        data: generateCustomerOutletVisitData()
      }
    ]
  }
];
