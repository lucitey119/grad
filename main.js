const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const USER = process.env.APP_USER || "";
const PASSWORD = process.env.APP_PASS || "";

if (!USER || !PASSWORD) {
    console.error("Missing APP_USER or APP_PASS in .env file");
    process.exit(1);
}

async function loginAndCheckStatus() {
    try {
        // Step 1: Get the login page to capture cookies and possibly a CSRF token.
        const loginPageResponse = await axios.get('https://app.gradient.network/', {
            // Optionally, enable cookie jar support if the site uses cookies heavily.
            // You can use the axios-cookiejar-support package for that.
        });
        
        const $ = cheerio.load(loginPageResponse.data);
        // Example: if the page contains a CSRF token in a hidden input field named 'csrf_token'
        const csrfToken = $('input[name=csrf_token]').attr('value') || '';

        // Step 2: Post the login credentials.
        // (You may need to adjust the URL and parameters based on how the site accepts login data.)
        const loginResponse = await axios.post('https://app.gradient.network/login', {
            email: USER,
            password: PASSWORD,
            // include the token if necessary
            csrf_token: csrfToken 
        }, {
            // To include cookies from the previous request, you might need to use a cookie jar.
            headers: {
                // You can mimic a browser’s headers here if required:
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/112.0.0.0 Mobile Safari/537.36',
                'Content-Type': 'application/json'
            }
        });

        // Step 3: Check if the login was successful.
        // Adjust this check based on the expected response from the server.
        if (loginResponse.data && loginResponse.data.success) {
            console.log("Login successful!");
            // Optionally, you can now make an authenticated request to another page.
            const dashboardResponse = await axios.get('https://app.gradient.network/dashboard', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/112.0.0.0 Mobile Safari/537.36'
                }
                // Ensure cookies or tokens are passed if needed.
            });
            console.log("Dashboard loaded. Status length:", dashboardResponse.data.length);
        } else {
            console.log("Login failed! Response:", loginResponse.data);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

loginAndCheckStatus();
