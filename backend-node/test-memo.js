const { fetchCreditDebitMemoFromSAP } = require('./services/creditDebitMemoService');

console.log('Testing SAP Credit/Debit Memo Service...');
fetchCreditDebitMemoFromSAP('0000100000').then(result => {
  console.log('SUCCESS! Credit/Debit Memo Data Retrieved:');
  console.log('Debit Memos:', result.debitMemos.length);
  console.log('Credit Memos:', result.creditMemos.length);
  console.log('Total Records:', result.totalRecords);
  console.log('Summary:', JSON.stringify(result.summary, null, 2));
  
  if (result.debitMemos.length > 0) {
    console.log('Sample Debit Memo:', JSON.stringify(result.debitMemos[0], null, 2));
  }
  
  if (result.creditMemos.length > 0) {
    console.log('Sample Credit Memo:', JSON.stringify(result.creditMemos[0], null, 2));
  }
}).catch(error => {
  console.error('ERROR:', error.message);
  console.error('Stack:', error.stack);
});
