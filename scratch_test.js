const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.get('http://localhost:5000/api/kot?active=all');
    const kots = res.data.kots || res.data.data;
    
    const cancelled = kots.filter(k => k.status === 'Cancelled');
    const seen = new Set();
    const dups = [];
    
    cancelled.forEach(k => {
      const key = `${k.kotId}-${k.id}`;
      if (seen.has(key)) {
        dups.push(key);
      } else {
        seen.add(key);
      }
    });

    console.log(`Total Cancelled KOTs from API: ${cancelled.length}`);
    console.log(`Duplicates based on kotId: ${dups.length}`);
    if (dups.length > 0) {
      console.log('Duplicate IDs:', dups);
    } else {
      // Maybe check if same items, same table?
      console.log('No exact kotId duplicates. Checking for identical custom_bill_number...');
      const customBillNos = {};
      cancelled.forEach(k => {
        if(!customBillNos[k.id]) customBillNos[k.id] = 0;
        customBillNos[k.id]++;
      });
      for(const [id, count] of Object.entries(customBillNos)) {
        if(count > 1) console.log(`custom_bill_number ${id} appears ${count} times!`);
      }
    }
  } catch(e) {
    console.error(e.message);
  }
}
testApi();
