## 🔧 SAP Vendor Profile Integration - Debugging Guide

### Issue: Backend returning 500 Internal Server Error

#### Step 1: Run Debug Script
```bash
cd backend-node
node debug-vendor-profile.js
```

#### Step 2: Check if ZVP_PROFILE_FM exists in SAP
1. Go to SAP GUI (SE80 or SE37)
2. Test function module `ZVP_PROFILE_FM`
3. Use these parameters:
   - IV_LIFNR: `0000100001`
   - Expected exports: EV_LIFNR, EV_NAME1, EV_LAND1, EV_ORT01, SUCCESS, MESSAGE

#### Step 3: Possible Issues & Solutions

**Issue A: Function Module Doesn't Exist**
- Create ZVP_PROFILE_FM using the code in `SAP-ZVP_PROFILE_FM.abap`
- Make sure it's RFC-enabled
- Activate the function module

**Issue B: Web Service Not Created**
- Go to SOAMANAGER in SAP
- Create web service for ZVP_PROFILE_FM
- Service name: ZVP_PROFILE_SERVICE
- Endpoint: `/sap/bc/srt/scs/sap/zvp_profile_service`

**Issue C: Wrong Parameters**
- Function module expects `IV_LIFNR` (input)
- Returns: `EV_LIFNR`, `EV_NAME1`, `EV_LAND1`, `EV_ORT01`, `SUCCESS`, `MESSAGE`

#### Step 4: Alternative Testing

If ZVP_PROFILE_FM doesn't exist, test with working login service:
```bash
# Test with existing login service
curl -X POST http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zvp_login_service?sap-client=100 \
  -H "Content-Type: text/xml" \
  -u "k901705:Sameena@1911" \
  -d '<?xml version="1.0"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
  <soapenv:Body>
    <urn:ZVP_LOGIN_FM>
      <VENDOR_ID>0000100001</VENDOR_ID>
      <PASSWORD>test123</PASSWORD>
    </urn:ZVP_LOGIN_FM>
  </soapenv:Body>
</soapenv:Envelope>'
```

#### Expected Working Response:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
  <soap-env:Body>
    <n0:ZVP_PROFILE_FMResponse xmlns:n0="urn:sap-com:document:sap:rfc:functions">
      <EV_LIFNR>0000100001</EV_LIFNR>
      <EV_NAME1>Vendor for Kaar</EV_NAME1>
      <EV_LAND1>IN</EV_LAND1>
      <EV_ORT01>Chennai</EV_ORT01>
      <SUCCESS>X</SUCCESS>
      <MESSAGE>Vendor profile retrieved successfully</MESSAGE>
    </n0:ZVP_PROFILE_FMResponse>
  </soap-env:Body>
</soap-env:Envelope>
```

#### Step 5: Quick Fix (Temporary)
If SAP function doesn't exist, I can modify the service to fetch from LFA1 directly through a different approach.
