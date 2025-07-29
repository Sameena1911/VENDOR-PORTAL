// Clear browser authentication script
// Run this in browser console to clear all auth data

console.log('🧹 Clearing all authentication data...');

// Clear localStorage
localStorage.clear();
console.log('✅ localStorage cleared');

// Clear sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage cleared');

// Clear cookies (if any)
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies cleared');

console.log('🎉 All authentication data cleared! Refresh the page.');
console.log('🔒 You should now be redirected to login page.');
