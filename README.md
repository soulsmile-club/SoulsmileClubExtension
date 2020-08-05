# Soulsmile Club Browser Extension

## About Soulsmile Club

Soulsmile Club is a new donation platform that allows you to give a portion of your online purchases to charity (without spending any extra money!). This browser extension, which you can download at [tiny.cc/soulsmile-extension](http://tiny.cc/soulsmile-extension), allows users to earn "soulsmiles" while shopping online on any of our partner sites, which are then given to charity.

As users shop on our partner websites while using the browser extension, the retailers give Soulsmile Club a commission as a “thank you” for bringing them to their site, and Soulsmile Club donates 100% of these proceeds towards organizations working on some of the most pressing humanitarian issues today, such as COVID-19 relief and Black Lives Matter causes.

**User Consent:** Users are asked for express, informed consent before ever being redirected to an affiliate link. The user must click a button for any redirection to occur, and there is always a Disclosure on this page informing the user that they will be redirected to an affiliate link through which Soulsmile will earn commission. Users are also aware of this and are giving their express consent by downloading the Soulsmile Club extension and agreeing to our Terms and Conditions, noted at [www.soulsmile.club/privacy-policy](https://www.soulsmile.club/privacy-policy).

See more information about Soulsmile Club at [www.soulsmile.club](https://www.soulsmile.club).

## Technologies Used

This extension was built as a React app. Other APIs and technologies used include Boundary.js, Bootstrap, Chrome tabs, Chrome storage, and Chrome browser pages.

## Directions for Running Locally

1. Run `npm run build`. This builds the app for production to the `build` folder.

2. To build the extension within Google Chrome, go to `chrome://extensions` from the Chrome browser and enable **Developer Mode**.

3. Click **Load unpacked** and select the `build` folder.

## Instructions for Adding New Affiliate Partners

1. Add link to `manifest.json` under `matches` under `content_scripts` so that notifications can be displayed when visiting the partner site.

2. Add information regarding the affiliate link in `public/files/affiliates.json`. The JSON file should always have the shortened domain name as the key, and the value should be another JSON object that always contains the boolean `extensionAllowed`.

     * If `extensionAllowed` is true, the JSON should also contain `productPageLinks`, which is true if the affiliate allows us to create custom affiliate links for particular product pages (by inserting a query parameter in the URL).
     
          * If `productPageLinks` is true, the JSON will contain `queryParameterName` and `queryParameterValue`, which are the name and value of the query parameter that must be inserted on any product page in order to track Soulsmile as the referrer.
     
          * If `productPageLinks` is false and the partner site does not allow us to create an affiliate link on particular product pages, we will always redirect users to their homepage affiliate link, regardless of the page they were previously on. In this case, the JSON object will contain a string called `link`, which is the homepage affiliate link that we will always redirect to, given user consent.

     * Finally, if `extensionAllowed` is false, we have not yet gotten explicit approval from the partner site to use their affiliate links in our browser extension. Therefore, we will instead redirect to the Soulsmile website, where users can click the affiliate link themselves. The JSON value will contain a `keyword` that we can use to redirect to the page on our Soulsmile website that contains the affiliate link for that partner (at www.soulsmile.club/retailers/keyword).

3. Add domain name to `public/files/checkout.json` as the key, along with a keyword that should appear in the URL when on a checkout page for that website (ex: if the user is taken to www.example.com/checkout/1234, "checkout" is likely the URL keyword to insert with example.com).

4. If partner has given us a coupon code to be used, add details about the coupon code and the structure of the cart page in `public/files/coupon.json`. The structure of the JSON file should have the domain name as the key and a JSON object with 4 elements as the value, containing: a keyword in the URL indicating the cart page as `cartUrlKeyword`, the id of the HTML input tag where the coupon code should be inserted as `couponCodeElementId`, the coupon code itself (ex: SOULSMILE) as `couponCode`, and the name attribute of the HTML submit button on the coupon code form as `submitButtonName`.

## Authors

* Sneha Rampalli

* Sneha Advani