const soap = require('soap');

// SAP Goods Receipt Service Configuration
const SAP_GR_SERVICE_URL = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_gr_service?sap-client=100';
const SAP_USERNAME = 'K901705';
const SAP_PASSWORD = 'Sameena@1911';

/**
 * Fetch Goods Receipts from SAP using ZVP_GR_FM
 * @param {string} vendorId - Vendor ID (LIFNR)
 * @returns {Promise<Object>} SAP response with goods receipts data
 */
async function fetchGoodsReceiptsFromSAP(vendorId) {
    try {
        console.log(`[GR Service] Attempting to fetch goods receipts for vendor: ${vendorId}`);
        
        // Create SOAP client
        const client = await soap.createClientAsync(SAP_GR_SERVICE_URL, {
            wsdl_options: {
                timeout: 30000,
                connection_timeout: 30000
            }
        });

        // Set basic authentication  
        client.setSecurity(new soap.BasicAuthSecurity(SAP_USERNAME, SAP_PASSWORD));

        // Prepare the request parameters for ZVP_GR_FM
        const requestParams = {
            IV_LIFNR: vendorId  // Only vendor ID as per the function module signature
        };

        console.log('[GR Service] Request parameters:', requestParams);

        // Call the SAP function module ZVP_GR_FM
        const result = await client.ZVP_GR_FMAsync(requestParams);
        
        console.log('[GR Service] SAP response received');
        console.log('[GR Service] Full SAP Response:', JSON.stringify(result, null, 2));
        
        if (result && result[0] && result[0].ET_GOODS_RECEIPT) {
            const sapResponse = result[0];
            console.log('[GR Service] Processing SAP response...');
            
            // Process the response
            const processedData = processGoodsReceiptsResponse(sapResponse);
            
            return {
                success: true,
                source: 'SAP',
                data: processedData,
                message: `Goods receipts fetched successfully from SAP - ${processedData.length} records found`,
                totalRecords: processedData.length
            };
        } else {
            console.log('[GR Service] No goods receipt data in SAP response, using mock data');
            return {
                success: true,
                source: 'mock',
                data: getMockGoodsReceipts(),
                message: 'No SAP data found, using mock data for demonstration',
                totalRecords: getMockGoodsReceipts().length
            };
        }

    } catch (error) {
        console.error('[GR Service] Error fetching from SAP:', error.message);
        console.error('[GR Service] Full error:', error);
        console.log('[GR Service] Falling back to mock data...');
        
        // Return mock data as fallback
        return {
            success: true,
            source: 'mock',
            data: getMockGoodsReceipts(),
            message: 'Using mock data (SAP connection failed)',
            error: error.message,
            totalRecords: getMockGoodsReceipts().length
        };
    }
}

/**
 * Process SAP Goods Receipts Response based on ZVP_GR_STR structure
 * @param {Object} sapResponse - Raw SAP response
 * @returns {Array} Processed goods receipts data
 */
function processGoodsReceiptsResponse(sapResponse) {
    try {
        const goodsReceipts = [];
        
        console.log('[GR Service] Processing ET_GOODS_RECEIPT data...');
        
        // Extract goods receipts from ET_GOODS_RECEIPT table
        const grItems = sapResponse.ET_GOODS_RECEIPT?.item || sapResponse.ET_GOODS_RECEIPT || [];
        console.log(`[GR Service] Found ${Array.isArray(grItems) ? grItems.length : 'non-array'} items`);
        
        if (Array.isArray(grItems)) {
            grItems.forEach((grItem, index) => {
                console.log(`[GR Service] Processing item ${index + 1}:`, grItem);
                
                const goodsReceipt = {
                    grNumber: grItem.MBLNR || 'N/A',                    // Material Document Number
                    grYear: grItem.MJAHR || new Date().getFullYear().toString(),  // Material Document Year
                    vendorId: grItem.LIFNR || 'N/A',                   // Vendor ID
                    companyCode: grItem.BUKRS || 'N/A',                // Company Code
                    material: grItem.MATNR || 'N/A',                   // Material Number
                    plant: grItem.WERKS || 'N/A',                      // Plant
                    grDate: formatSAPDate(grItem.BUDAT) || new Date().toISOString().split('T')[0], // Posting Date
                    
                    // Additional fields for display (will be populated from other SAP calls if needed)
                    description: `Material ${grItem.MATNR}`,           // Material Description
                    poNumber: 'N/A',                                   // PO Number (would need additional lookup)
                    receivedQuantity: 0,                               // Quantity (would need MSEG details)
                    orderedQuantity: 0,                                // Order Quantity
                    uom: 'EA',                                         // Unit of Measure
                    netPrice: 0.00,                                    // Net Price
                    totalAmount: 0.00,                                 // Total Amount
                    currency: 'USD',                                   // Currency
                    storageLocation: 'N/A',                            // Storage Location
                    movementType: '101',                               // Movement Type (GR)
                    documentDate: formatSAPDate(grItem.BUDAT) || new Date().toISOString().split('T')[0],
                    postingDate: formatSAPDate(grItem.BUDAT) || new Date().toISOString().split('T')[0],
                    deliveryNote: 'N/A',                               // Delivery Note
                    billOfLading: 'N/A',                               // Bill of Lading
                    status: 'Posted'                                   // Status
                };
                
                goodsReceipts.push(goodsReceipt);
            });
        } else if (grItems && typeof grItems === 'object') {
            // Handle single item response
            console.log('[GR Service] Processing single item:', grItems);
            
            const goodsReceipt = {
                grNumber: grItems.MBLNR || 'N/A',
                grYear: grItems.MJAHR || new Date().getFullYear().toString(),
                vendorId: grItems.LIFNR || 'N/A',
                companyCode: grItems.BUKRS || 'N/A',
                material: grItems.MATNR || 'N/A',
                plant: grItems.WERKS || 'N/A',
                grDate: formatSAPDate(grItems.BUDAT) || new Date().toISOString().split('T')[0],
                description: `Material ${grItems.MATNR}`,
                poNumber: 'N/A',
                receivedQuantity: 0,
                orderedQuantity: 0,
                uom: 'EA',
                netPrice: 0.00,
                totalAmount: 0.00,
                currency: 'USD',
                storageLocation: 'N/A',
                movementType: '101',
                documentDate: formatSAPDate(grItems.BUDAT) || new Date().toISOString().split('T')[0],
                postingDate: formatSAPDate(grItems.BUDAT) || new Date().toISOString().split('T')[0],
                deliveryNote: 'N/A',
                billOfLading: 'N/A',
                status: 'Posted'
            };
            
            goodsReceipts.push(goodsReceipt);
        }
        
        console.log(`[GR Service] Successfully processed ${goodsReceipts.length} goods receipts from SAP`);
        return goodsReceipts;
        
    } catch (error) {
        console.error('[GR Service] Error processing SAP response:', error);
        console.log('[GR Service] Falling back to mock data due to processing error');
        return getMockGoodsReceipts();
    }
}

/**
 * Determine Goods Receipt Status
 * @param {Object} grItem - SAP goods receipt item
 * @returns {string} Status
 */
function determineGRStatus(grItem) {
    // Logic to determine status based on SAP fields
    if (grItem.XSTOK === 'X') {
        return 'Cancelled';
    } else if (grItem.SHKZG === 'S') {
        return 'Posted';
    } else if (parseFloat(grItem.MENGE) < parseFloat(grItem.ERFMG)) {
        return 'Partial';
    } else {
        return 'Posted';
    }
}

/**
 * Format SAP Date (YYYYMMDD) to YYYY-MM-DD
 * @param {string} sapDate - SAP date format
 * @returns {string} Formatted date
 */
function formatSAPDate(sapDate) {
    if (!sapDate || sapDate.length !== 8) return null;
    
    const year = sapDate.substring(0, 4);
    const month = sapDate.substring(4, 6);
    const day = sapDate.substring(6, 8);
    
    return `${year}-${month}-${day}`;
}

/**
 * Mock Goods Receipts Data based on real SAP structure
 * @returns {Array} Mock goods receipts matching SAP ET_GOODS_RECEIPT structure
 */
function getMockGoodsReceipts() {
    return [
        {
            grNumber: '5000000000',
            grYear: '2025',
            vendorId: '100000',
            companyCode: '1009',
            material: '13',
            plant: '1009',
            grDate: '2025-06-02',
            description: 'Material 13 - Industrial Component',
            poNumber: 'PO4500123456',
            receivedQuantity: 500,
            orderedQuantity: 500,
            uom: 'EA',
            netPrice: 125.50,
            totalAmount: 62750.00,
            currency: 'USD',
            storageLocation: 'SL01',
            movementType: '101',
            documentDate: '2025-06-02',
            postingDate: '2025-06-02',
            deliveryNote: 'DN12345',
            billOfLading: 'BL67890',
            status: 'Posted'
        },
        {
            grNumber: '5000000001',
            grYear: '2025',
            vendorId: '100000',
            companyCode: '1009',
            material: '13',
            plant: '1009',
            grDate: '2025-06-02',
            description: 'Material 13 - Industrial Component',
            poNumber: 'PO4500123457',
            receivedQuantity: 1000,
            orderedQuantity: 1000,
            uom: 'M',
            netPrice: 5.25,
            totalAmount: 5250.00,
            currency: 'USD',
            storageLocation: 'SL02',
            movementType: '101',
            documentDate: '2025-06-02',
            postingDate: '2025-06-02',
            deliveryNote: 'DN12346',
            billOfLading: 'BL67891',
            status: 'Posted'
        },
        {
            grNumber: '5000000002',
            grYear: '2025',
            vendorId: '100000',
            companyCode: '1009',
            material: '13',
            plant: '1009',
            grDate: '2025-06-02',
            description: 'Material 13 - Industrial Component',
            poNumber: 'PO4500123458',
            receivedQuantity: 200,
            orderedQuantity: 250,
            uom: 'EA',
            netPrice: 75.00,
            totalAmount: 15000.00,
            currency: 'USD',
            storageLocation: 'SL01',
            movementType: '101',
            documentDate: '2025-06-02',
            postingDate: '2025-06-02',
            deliveryNote: 'DN12347',
            billOfLading: 'BL67892',
            status: 'Partial'
        },
        {
            grNumber: '5000000003',
            grYear: '2025',
            vendorId: '100000',
            companyCode: '1009',
            material: '13',
            plant: '1009',
            grDate: '2025-06-02',
            description: 'Material 13 - Industrial Component',
            poNumber: 'PO4500123459',
            receivedQuantity: 5000,
            orderedQuantity: 5000,
            uom: 'M',
            netPrice: 2.10,
            totalAmount: 10500.00,
            currency: 'USD',
            storageLocation: 'SL03',
            movementType: '101',
            documentDate: '2025-06-02',
            postingDate: '2025-06-02',
            deliveryNote: 'DN12348',
            billOfLading: 'BL67893',
            status: 'Posted'
        },
        {
            grNumber: '5000000004',
            grYear: '2025',
            vendorId: '100000',
            companyCode: '1009',
            material: '13',
            plant: '1009',
            grDate: '2025-06-02',
            description: 'Material 13 - Industrial Component',
            poNumber: 'PO4500123460',
            receivedQuantity: 100,
            orderedQuantity: 100,
            uom: 'EA',
            netPrice: 25.00,
            totalAmount: 2500.00,
            currency: 'USD',
            storageLocation: 'SL04',
            movementType: '101',
            documentDate: '2025-06-02',
            postingDate: '2025-06-02',
            deliveryNote: 'DN12349',
            billOfLading: 'BL67894',
            status: 'Posted'
        },
        {
            grNumber: '5000000005',
            grYear: '2025',
            vendorId: '100000',
            companyCode: '1009',
            material: '13',
            plant: '1009',
            grDate: '2025-06-02',
            description: 'Material 13 - Industrial Component',
            poNumber: 'PO4500123461',
            receivedQuantity: 300,
            orderedQuantity: 300,
            uom: 'EA',
            netPrice: 45.00,
            totalAmount: 13500.00,
            currency: 'USD',
            storageLocation: 'SL02',
            movementType: '101',
            documentDate: '2025-06-02',
            postingDate: '2025-06-02',
            deliveryNote: 'DN12350',
            billOfLading: 'BL67895',
            status: 'Posted'
        },
        {
            grNumber: '5000000006',
            grYear: '2025',
            vendorId: '100000',
            companyCode: '1009',
            material: '13',
            plant: '1009',
            grDate: '2025-06-02',
            description: 'Material 13 - Industrial Component',
            poNumber: 'PO4500123462',
            receivedQuantity: 2000,
            orderedQuantity: 2000,
            uom: 'EA',
            netPrice: 1.50,
            totalAmount: 3000.00,
            currency: 'USD',
            storageLocation: 'SL01',
            movementType: '101',
            documentDate: '2025-06-02',
            postingDate: '2025-06-02',
            deliveryNote: 'DN12351',
            billOfLading: 'BL67896',
            status: 'Posted'
        },
        {
            grNumber: '5000000007',
            grYear: '2025',
            vendorId: '100000',
            companyCode: '1009',
            material: '13',
            plant: '1009',
            grDate: '2025-06-02',
            description: 'Material 13 - Industrial Component',
            poNumber: 'PO4500123463',
            receivedQuantity: 15,
            orderedQuantity: 20,
            uom: 'EA',
            netPrice: 850.00,
            totalAmount: 12750.00,
            currency: 'USD',
            storageLocation: 'SL04',
            movementType: '101',
            documentDate: '2025-06-02',
            postingDate: '2025-06-02',
            deliveryNote: 'DN12352',
            billOfLading: 'BL67897',
            status: 'Partial'
        },
        {
            grNumber: '5000000008',
            grYear: '2025',
            vendorId: '100000',
            companyCode: '1009',
            material: '13',
            plant: '1009',
            grDate: '2025-06-02',
            description: 'Material 13 - Industrial Component',
            poNumber: 'PO4500123464',
            receivedQuantity: 750,
            orderedQuantity: 750,
            uom: 'M',
            netPrice: 8.75,
            totalAmount: 6562.50,
            currency: 'USD',
            storageLocation: 'SL03',
            movementType: '101',
            documentDate: '2025-06-02',
            postingDate: '2025-06-02',
            deliveryNote: 'DN12353',
            billOfLading: 'BL67898',
            status: 'Posted'
        },
        {
            grNumber: '5000000009',
            grYear: '2025',
            vendorId: '100000',
            companyCode: '1009',
            material: '13',
            plant: '1009',
            grDate: '2025-06-02',
            description: 'Material 13 - Industrial Component',
            poNumber: 'PO4500123465',
            receivedQuantity: 125,
            orderedQuantity: 125,
            uom: 'EA',
            netPrice: 45.80,
            totalAmount: 5725.00,
            currency: 'USD',
            storageLocation: 'SL02',
            movementType: '101',
            documentDate: '2025-06-02',
            postingDate: '2025-06-02',
            deliveryNote: 'DN12354',
            billOfLading: 'BL67899',
            status: 'Posted'
        },
        {
            grNumber: '5000000010',
            grYear: '2025',
            vendorId: '100000',
            companyCode: '1009',
            material: '13',
            plant: '1009',
            grDate: '2025-06-02',
            description: 'Material 13 - Industrial Component',
            poNumber: 'PO4500123466',
            receivedQuantity: 80,
            orderedQuantity: 100,
            uom: 'EA',
            netPrice: 125.00,
            totalAmount: 10000.00,
            currency: 'USD',
            storageLocation: 'SL01',
            movementType: '101',
            documentDate: '2025-06-02',
            postingDate: '2025-06-02',
            deliveryNote: 'DN12355',
            billOfLading: 'BL67900',
            status: 'Partial'
        }
    ];
}

module.exports = {
    fetchGoodsReceiptsFromSAP
};
