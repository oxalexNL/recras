[![Build Status](https://travis-ci.org/Recras/online-booking-js.svg?branch=master)](https://travis-ci.org/Recras/online-booking-js)

# Recras Online Booking JS library
Version: 1.1.2

JS library for easy online booking & voucher integration


## Getting started
### Online booking
In your HTML document,
1. include the `dist/onlinebooking.js` script
1. add an element where you want the integration to appear
1. give the element a unique ID, i.e. `<div id="recras-onlinebooking"></div>`
1. initialize the script like this:
```
var options = new RecrasOptions({
    recras_hostname: 'demo.recras.nl', // Required
    element: document.getElementById('recras-onlinebooking'), // Required
});
new RecrasBooking(options);
```

### Buying vouchers
In your HTML document,
1. include the `dist/onlinebooking.js` script
1. add an element where you want the integration to appear
1. give the element a unique ID, i.e. `<div id="recras-vouchers"></div>`
1. initialize the script like this:
```
var options = new RecrasOptions({
    recras_hostname: 'demo.recras.nl', // Required
    element: document.getElementById('recras-vouchers'), // Required
});
new RecrasVoucher(options);
```
See the section Options below for an overview of all options

### Contact form
In your HTML document,
1. include the `dist/onlinebooking.js` script
1. add an element where you want the integration to appear
1. give the element a unique ID, i.e. `<div id="recras-contactform"></div>`
1. initialize the script like this:
```
var options = new RecrasOptions({
    recras_hostname: 'demo.recras.nl', // Required
    element: document.getElementById('recras-contactform'), // Required
    form_id: 4, // Required
});
var form = new RecrasContactForm(options);
form.showForm();
```
See the section Options below for an overview of all options

### Demos
See `/demo/index.html` for integration demos


## Options
### Global options
* `recras_hostname` - **required** - the name of your Recras, i.e. `demo.recras.nl`
* `element` - **required** - a single HTML element, using `getElementById` or `querySelector`
* `locale` - optional, defaults to nl_NL - a valid locale (de_DE, en_GB, and nl_NL). This is used for country names, error messages, etc. Package names from Recras are not affected.
* `analytics` - optional, defaults to `false` - set to `true` if you want to enable Google Analytics integration.
* `analyticsEvents` - optional - a list of events to track. `analytics` must be set to `true` for this to 
work. If omitted, all events will be sent. For a list of events, refer to the section Events at the end of this document.

### Online booking only
* `package_id` - optional - the ID of a package. This will hide the package selection dropdown and skip this step.
* `redirect_url` - optional - the URL to redirect to after a successful online booking. The URL will receive the created booking ID as `boeking_id` GET parameter (i.e. `?booking_id=42`). For more information on our booking API, we refer to our [booking API documentation](https://recras.github.io/docs/endpoints/boekingen.html).
* `autoScroll` - optional, defaults to `true` - whether or not to scroll the amounts form into view when changing packages. This is most useful if you select a package by default and don't want to scroll past the intro text, set it to `false` in that case.
* `previewTimes` - optional, defaults to `true` - whether or not to preview times for each line 
in the programme after selecting a date and time.
* `productAmounts` - optional, use in combination with `package_id`. Set this to an object where the keys are the package line ID's and the values are the amounts to enter, i.e. :
    ```
    {
        bookingsize: 16,
        1: 12,
        42: 16,
        43: 16,
    }
    ```
    The package line ID's can be obtained by inspecting the amounts form, or by checking the [packages API specification](https://demo.recras.nl/docs/api/endpoints/arrangementen.html) - use the `id` field for each entry in `regels`.

### Vouchers only
* `voucher_template_id` - optional - the ID of a voucher template. This will hide the template selection dropdown and skip this step.
* `redirect_url` - optional - the URL to redirect to after a successful payment. The URL will receive the created booking ID as `boeking_id` GET parameter (i.e. `?booking_id=42`). For more information on our API's, we refer to our [booking API documentation](https://recras.github.io/docs/endpoints/boekingen.html) and [voucher API documentation](https://recras.github.io/docs/endpoints/vouchers.html).

### Contact form only
* `form_id` - **required** - the ID of the form.
* `package_id` - optional - can be used to programmatically fill a "Booking - Package" field present in the contact form.
* `redirect_url` - optional - the URL to redirect to after a successful form submission.


## Styling
The library provides a bit of styling to make it look okay straight from the box. If you wish to customise the layout, you can. Just style the appropriate elements from your website's CSS.


## Browser support
This library uses various modern techniques that are unsupported in Internet Explorer, and/or old Edge, and/or old Safari. If you care about supporting old browsers, a polyfill should be loaded into your website. We recommend loading the following [Polyfill.io](https://polyfill.io/v2/docs/) script: `https://cdn.polyfill.io/v2/polyfill.min.js?features=default,fetch,Promise,RegExp.prototype.flags`

In modern browsers, this is only a very small file causing little overhead.


## Events
The library sends out a few custom events when certain things change:

* `Recras:Booking:Reset` - when the entire form is reset
* `Recras:Booking:PackagesShown` - when the list of packages is shown
* `Recras:Booking:PackageChanged` - when a new package is selected
* `Recras:Booking:ProductsShown` - when the products are shown after a package is selected
* `Recras:Booking:ContactFormShown` - when the contact form is shown after a package is selected
* `Recras:Booking:DateSelected` - when the date is changed
* `Recras:Booking:TimeSelected` - when the time is changed
* `Recras:Booking:BuyInProgress` - when the online booking form is submitted
* `Recras:Booking:RedirectToPayment` - when the user is redirected to the payment provider
* `Recras:ContactForm:Submit` - when a standalone form is submitted
* `Recras:Voucher:TemplateChanged` - when a new voucher template is selected
* `Recras:Voucher:BuyInProgress` - when the voucher form is submitted
* `Recras:Voucher:RedirectToPayment` - when the user is redirected to the payment provider

You can use these events for custom actions, such as analytics. For use in code, please refer to 
the constants in [src/eventHelper.js](src/eventHelper.js).
