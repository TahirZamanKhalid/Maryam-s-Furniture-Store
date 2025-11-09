# Email Setup Guide for Contact Form

This guide will help you configure the contact form to send emails to **ba5304831@gmail.com** using EmailJS.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Add Email Service

1. After logging in, go to **"Email Services"** in the sidebar
2. Click **"Add New Service"**
3. Select **"Gmail"** as your email service
4. Click **"Connect Account"** and sign in with **ba5304831@gmail.com**
5. Give your service a name (e.g., "Furniture Store Gmail")
6. Click **"Create Service"**
7. **Copy the Service ID** (you'll need this later)

## Step 3: Create Email Template

1. Go to **"Email Templates"** in the sidebar
2. Click **"Create New Template"**
3. Use this template configuration:

**Template Name:** Contact Form Submission

**Subject:** New Contact Form Submission from {{from_name}}

**Email Body:**
```
You have received a new message from your furniture store website!

From: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}

Message:
{{message}}

---
This email was sent automatically from the contact form on Maryam's Furniture Shop website.
```

4. In the **"To Email"** field, enter: **ba5304831@gmail.com**
5. Click **"Save"**
6. **Copy the Template ID** (shown at the top)

## Step 4: Get Your Public Key

1. Click on your name in the top-right corner
2. Go to **"Account"**
3. Find the **"API Keys"** section
4. Copy your **Public Key** (it looks like a random string)

## Step 5: Update Configuration File

1. Open the file: `js/email-config.js`
2. Replace the placeholder values with your actual credentials:

```javascript
const emailConfig = {
    // Replace with your Public Key from Step 4
    publicKey: 'paste_your_public_key_here',

    // Replace with your Service ID from Step 2
    serviceId: 'paste_your_service_id_here',

    // Replace with your Template ID from Step 3
    templateId: 'paste_your_template_id_here',

    // This is already set correctly
    recipientEmail: 'ba5304831@gmail.com'
};
```

3. Save the file

## Step 6: Test the Contact Form

1. Open your website in a browser
2. Navigate to the Contact section
3. Fill out the form with test data
4. Click "Send Message"
5. You should see a success message
6. Check **ba5304831@gmail.com** inbox for the email

## Troubleshooting

### Email not received?

1. **Check Spam folder** - EmailJS emails sometimes go to spam initially
2. **Verify credentials** - Make sure all IDs in `email-config.js` are correct
3. **Check EmailJS dashboard** - Go to the "Logs" section to see if the email was sent
4. **Browser console** - Open Developer Tools (F12) and check for any errors

### Common Issues

- **"EmailJS not configured" message**: Your credentials in `email-config.js` are not set
- **CORS errors**: Make sure you're accessing the site through a proper web server, not file://
- **Rate limit exceeded**: EmailJS free plan has limits (200 emails/month). Upgrade if needed.

## EmailJS Pricing

- **Free Plan**: 200 emails/month
- **Paid Plans**: Start at $7/month for more emails

For a small furniture store, the free plan should be sufficient. You can upgrade if you receive more contact form submissions.

## Security Note

The Public Key is safe to expose in client-side code. However, never share your Private Key if you have one.

## Need Help?

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- EmailJS Support: [https://www.emailjs.com/support/](https://www.emailjs.com/support/)

---

**Your configuration is ready once you complete all steps above!**
