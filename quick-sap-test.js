const { fetchPurchaseOrdersFromSAP } = require('./backend-node/services/purchaseOrderService');

async function quickTest() {
  console.log('🧪 Quick SAP Test with K901705/Sameena@1911');
  try {
    const result = await fetchPurchaseOrdersFromSAP('0000100000');
    console.log('✅ SUCCESS:', result.purchaseOrders?.length || 0, 'orders found');
    if (result.purchaseOrders?.length > 0) {
      console.log('First PO:', result.purchaseOrders[0]);
    }
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    if (error.message.includes('401')) {
      console.log('🚫 Authentication still failing with new credentials');
    }
  }
}

quickTest();
