// EmailJS Configuration for Maryam's Furniture Shop
// Email: ba5304831@gmail.com

// IMPORTANT: Replace these with your actual EmailJS credentials
// To get these credentials:
// 1. Go to https://www.emailjs.com/
// 2. Create a free account
// 3. Add an email service (Gmail)
// 4. Create an email template
// 5. Get your Public Key from Account page

const emailConfig = {
    // Your EmailJS Public Key (from https://dashboard.emailjs.com/admin/account)
    publicKey: 'YOUR_PUBLIC_KEY',

    // Your EmailJS Service ID (from https://dashboard.emailjs.com/admin)
    serviceId: 'YOUR_SERVICE_ID',

    // Your EmailJS Template ID (from https://dashboard.emailjs.com/admin/templates)
    templateId: 'YOUR_TEMPLATE_ID',

    // Recipient email
    recipientEmail: 'ba5304831@gmail.com'
};

// Initialize EmailJS with your public key
(function() {
    if (typeof emailjs !== 'undefined' && emailConfig.publicKey !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(emailConfig.publicKey);
    }
})();

// Export configuration
window.emailConfig = emailConfig;
