# Soulsmile Club Browser Extension

## About Soulsmile Club

Soulsmile Club is a new donation platform that allows you to give a portion of your online purchases to charity (without spending any extra money!). This browser extension, which you can download at [tiny.cc/soulsmile-extension](http://tiny.cc/soulsmile-extension), allows users to earn "soulsmiles" while shopping online on any of our partner sites, which are then given to charity.

As users shop on our partner websites while using the browser extension, the retailers give Soulsmile Club a commission as a “thank you” for bringing them to their site, and Soulsmile Club donates 100% of these proceeds towards organizations working on some of the most pressing humanitarian issues today, such as COVID-19 relief and Black Lives Matter causes.

See more information about Soulsmile Club at [www.soulsmile.club](http://www.soulsmile.club).

## Technologies Used

This extension was built as a React app. Other APIs and technologies used include Boundary.js, Bootstrap, Chrome tabs, Chrome storage, and Chrome browser pages.

## Directions for Running Locally

1. Run `npm run build`. This builds the app for production to the `build` folder.

2. To build the extension within Google Chrome, go to `chrome://extensions` from the Chrome browser and enable **Developer Mode**.

3. Click **Load unpacked** and select the `build` folder.

## Instructions for Adding New Affiliate Partners

1. Add link to `manifest.json` under `matches` under `content_scripts` so that notifications can be displayed when visiting the partner site.

2. Add information regarding the affiliate link in `public/affiliates.json`. The structure of the JSON file should have the domain name as the key, and add an array with 2 elements as the value: [a boolean indicating whether or not we can redirect to affiliate product pages, the affiliate link OR the query parameter name, (optional) the query parameter value]. If the partner site does not allow us to create an affiliate link on particular product pages, we will always redirect users to their homepage affiliate link, regardless of the page they were previously on. The JSON value with simply contains [false, affiliate link]. However, if the partner site does allow us to have affiliate links for different product pages, we will insert the query parameter into the user's current URL. In this case, the JSON value would look like [true, query parameter name, query parameter value].

3. Add domain name to `public/checkout.json` as the key, along with a keyword that should appear in the URL when on a checkout page for that website (ex: if the user is taken to www.example.com/checkout/1234, "checkout" is likely the URL keyword to insert with example.com).

4. If partner has given us a coupon code to be used, add details about the coupon code and the structure of the cart page in `public/coupon.json`. The structure of the JSON file should have the domain name as the key and an array with 4 elements as the value: [a keyword in the URL indicating the cart page, the id of the HTML input tag where the coupon code should be inserted, the coupon code itself (ex: SOULSMILE), the name attribute of the HTML submit button on the coupon code form].

## Authors

* Sneha Rampalli

* Sneha Advani

* Hannah Gonzalez