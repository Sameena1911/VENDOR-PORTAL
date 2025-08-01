const { fetchGoodsReceiptsFromSAP } = require('./services/goodsReceiptService');

async function testGoodsReceiptService() {
    console.log('🧪 Testing Goods Receipt SAP Service...');
    console.log('='.repeat(50));
    
    try {
        const testVendorId = '100000'; // Use the vendor ID from your attachments
        console.log(`Testing with Vendor ID: ${testVendorId}`);
        
        const result = await fetchGoodsReceiptsFromSAP(testVendorId);
        
        console.log('\n✅ Service Response:');
        console.log('Success:', result.success);
        console.log('Source:', result.source);
        console.log('Message:', result.message);
        console.log('Total Records:', result.totalRecords);
        
        if (result.data && result.data.length > 0) {
            console.log('\n📋 Sample Records:');
            result.data.slice(0, 3).forEach((gr, index) => {
                console.log(`\nRecord ${index + 1}:`);
                console.log(`  GR Number: ${gr.grNumber}`);
                console.log(`  GR Year: ${gr.grYear}`);
                console.log(`  Vendor ID: ${gr.vendorId}`);
                console.log(`  Company Code: ${gr.companyCode}`);
                console.log(`  Material: ${gr.material}`);
                console.log(`  Plant: ${gr.plant}`);
                console.log(`  GR Date: ${gr.grDate}`);
                console.log(`  Status: ${gr.status}`);
            });
        }
        
        if (result.source === 'SAP') {
            console.log('\n🎉 SUCCESS: Connected to SAP backend!');
        } else {
            console.log('\n⚠️  INFO: Using mock data (SAP not available)');
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(50));
}

// Run the test
testGoodsReceiptService();
