# Recras Online Booking JS library

JS library for easy online booking integration

## Getting started
In your HTML document,
1. include the `src/onlinebooking.js` script
1. add an element where you want the integration to appear
1. give the element a unique ID, i.e. `<div id="recras-onlinebooking"></div>`
1. initialize the script like this:
```
new Recrasbooking({
    recras_hostname: 'demo.recras.nl', // Required
    element: document.getElementById('recras-onlinebooking'), // Required
});
```
See the chapter Options below for an overview of all options

## Options
* `recras_hostname` - the name of your Recras, i.e. `demo.recras.nl`
* `element` - a single HTML element, using `getElementById` or `querySelector`
* `locale` - a valid locale (de_DE, en_GB, and nl_NL). This is used for country names, error messages, etc. Package names from Recras are not affected.
* `start_time` - to be added later
* `skip_steps` - to be added later
* `group_size` - to be added later

## Styling
The library provides a bit of styling to make it look okay straight from the box. If you wish to customise the layout, you can. Just style the appropriate elements from your website's CSS.  