# Seedlys Natural

A simple, mobile-friendly storefront for Seedlys Natural's garlic chips, blue tea, and beetroot powder. The site is made with plain HTML, CSS, and JavaScript, so it does not need a build tool or an installation step.

## Preview the website

Open `index.html` in a web browser. The Google Fonts used by the design need an internet connection; the rest of the site is included in this folder.

## Website pages

- `index.html` — home page
- `shop.html` — product collection
- `product.html` — product details, selected with a URL such as `product.html?id=1`
- `cart.html` — shopping cart and WhatsApp order enquiry
- `about.html` — brand story
- `contact.html` — contact information and enquiry form

## Update the products

Edit the product names, descriptions, image paths, and prices in `js/products.js`. Prices are currently unset, so the site asks customers to confirm them on WhatsApp. The product illustrations in `images/` are placeholders and can be replaced with real product photos.

Before accepting orders, check the WhatsApp number used by the site and replace the sample UPI ID and QR placeholder on the cart page with verified payment details. The website sends order enquiries to WhatsApp; it does not process payments itself.

## Publish with GitHub Pages

Upload this project to a GitHub repository. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select the `main` branch and the `/ (root)` folder, then save. GitHub will provide the public website address after deployment.
