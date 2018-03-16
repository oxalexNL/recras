/**********************************
*  Recras Online Booking library  *
*  v 0.0.1                        *
**********************************/
'use strict';

class Recrasbooking {
    constructor(options) {
        this.PACKAGE_SELECTION = 'package_selection';
        this.DATE_SELECTION = 'date_selection';
        this.GENDERS = {
            onbekend: 'Unknown',
            man: 'Male',
            vrouw: 'Female',
        };
        // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#inappropriate-for-the-control
        this.AUTOCOMPLETE_OPTIONS = {
            'contactpersoon.voornaam': 'given-name',
            'contactpersoon.achternaam': 'family-name',
            'contact.landcode': 'country',
            'contact.naam': 'organization',
            'contactpersoon.adres': 'address-line1',
            'contactpersoon.postcode': 'postal-code',
            'contactpersoon.plaats': 'address-level2',
        };

        const CSS = `
.recras-onlinebooking > div {
border-top: 2px solid #dedede; /* Any love for Kirby out there? */
    padding: 1em 0;
}
.recras-contactform div, .recras-amountsform div {
    display: flex;
    justify-content: space-between;
    padding: 0.25em 0;
}
`;
        const hostnameRegex = new RegExp(/^[a-z0-9\-]+\.recras\.nl$/, 'i');
        const validLocales = ['de_DE', 'en_GB', 'nl_NL'];

        if (!options.element) {
            throw new Error('Option "element" not set.');
        }
        if (!options.recras_hostname) {
            throw new Error('Option "recras_hostname" not set.');
        }
        if (!hostnameRegex.test(options.recras_hostname)) {
            throw new Error('Option "recras_hostname" is invalid.');
        }

        this.locale = 'nl_NL';
        if (options.locale) {
            if (validLocales.indexOf(options.locale) === -1) {
                console.warn('Invalid locale. Valid options are: ' + validLocales.join(', '));
            } else {
                this.locale = options.locale;
            }
        }

        this.element = options.element;
        this.hostname = options.recras_hostname;

        this.element.classList.add('recras-onlinebooking');
        this.loadCSS(CSS);
        this.loadScripts();

        this.getPackages().then(packages => {
            this.showPackages(packages);
        });
    }

    amendHtml(msg) {
        this.setHtml(this.element.innerHTML + msg);
    }

    error(msg) {
        this.setHtml(`<strong>Something went wrong:</strong><p>${ msg }</p>`);
    }

    fetchJson(url) {
        return fetch(url, {
            method: 'get'
        }).then(response => {
            if (response.status < 200 || response.status >= 400) {
                this.error(response.status + ' ' + response.statusText);
                return false;
            }
            return response.json();
        }).then(json => {
            return json;
        }).catch(err => {
            this.error(err);
        });
    }

    getContactFormFields(pack) {
        return this.fetchJson('https://' + this.hostname + '/api2/contactformulieren/' + pack.onlineboeking_contactformulier_id + '/velden')
            .then(json => {
                this.contactFormFields = json;
                return this.contactFormFields;
            });
    }

    getCountryList(locale) {
        return this.fetchJson('https://cdn.rawgit.com/umpirsky/country-list/ddabf3a8/data/' + locale + '/country.json')
            .then(json => {
                this.countries = json;
                return this.countries;
            });
    }

    getPackages() {
        return this.fetchJson('https://' + this.hostname + '/api2/arrangementen')
            .then(json => {
                this.packages = json;
                return this.packages;
            });
    }

    loadCSS(content) {
        let styleEl = document.createElement('style');
        styleEl.innerHTML = content;

        let refNode = document.head;
        refNode.parentNode.insertBefore(styleEl, refNode);
    }

    loadScripts() {
        //TODO: load Pikaday
    }

    setHtml(msg) {
        this.element.innerHTML = msg;
    }

    sortPackages(packages) {
        // Packages from the API are sorted by internal name, not by display name
        // However, display name is not required so fallback to internal name
        return packages.sort((a, b) => {
            let aName = a.weergavenaam || a.arrangement;
            let bName = b.weergavenaam || b.arrangement;
            if (aName < bName) {
                return -1;
            }
            if (aName > bName) {
                return -1;
            }
            return 0;
        });
    }

    shouldShowBookingSize(pack) {
        return pack.regels.filter(line => {
            return line.onlineboeking_aantalbepalingsmethode === 'boekingsgrootte';
        }).length > 0;
    }

    showContactForm(pack) {
        this.getContactFormFields(pack).then(fields => {
            fields = fields.sort((a, b) => {
                return a.sort_order - b.sort_order;
            });

            let waitFor = [];

            let hasCountryField = fields.filter(field => {
                return field.field_identifier === 'contact.landcode';
            }).length > 0;
            let hasNewsletterField = fields.filter(field => {
                return field.field_identifier === 'contactpersoon.nieuwsbrieven';
            }).length > 0;

            if (hasCountryField) {
                waitFor.push(this.getCountryList(this.locale));
            }
            if (hasNewsletterField) {
                //TODO: /api2/nieuwsbrieven is geen openbare API
            }
            Promise.all(waitFor).then(() => {
                let html = '<div class="recras-contactform">';
                fields.forEach((field, idx) => {
                    html += '<div>' + this.showContactFormField(field, idx) + '</div>';
                });
                html += '</div>';
                this.amendHtml(html);
            });
        });
    }

    showContactFormField(field, idx) {
        if (field.soort_invoer === 'header') {
            return `<h3>${ field.naam }</h3>`;
        }

        let label = this.showContactFormLabel(field, idx);
        let attrRequired = field.verplicht ? 'required' : '';
        let html;
        switch (field.soort_invoer) {
            case 'contactpersoon.geslacht':
                html = `<select id="contactformulier-${ idx }" name="contactformulier${ idx }" ${ attrRequired } autocomplete="sex">`;
                Object.keys(this.GENDERS).forEach(key => {
                    html += `<option value="${ key }">${ this.GENDERS[key] }`;
                });
                html += '</select>';
                return label + html;
            case 'keuze':
                html = `<select id="contactformulier-${ idx }" name="contactformulier${ idx }" ${ attrRequired } multiple>`;
                field.mogelijke_keuzes.forEach(choice => {
                    html += `<option value="${ choice }">${ choice }`;
                });
                html += '</select>';
                return label + html;
            case 'veel_tekst':
                return label + `<textarea id="contactformulier-${ idx }" name="contactformulier${ idx }" ${ attrRequired }></textarea>`;
            case 'contactpersoon.telefoon1':
                return label + `<input type="tel" id="contactformulier-${ idx }" name="contactformulier${ idx }" ${ attrRequired } autocomplete="tel">`;
            case 'contactpersoon.email1':
                return label + `<input type="email" id="contactformulier-${ idx }" name="contactformulier${ idx }" ${ attrRequired } autocomplete="email">`;
            case 'contactpersoon.nieuwsbrieven':
                return label + 'TODO: niewsbrieven'; //TODO
            case 'contact.landcode':
                html = `<select id="contactformulier-${ idx }" name="contactformulier${ idx }" ${ attrRequired }>`;
                Object.keys(this.countries).forEach(code => {
                    html += `<option value="${ code }">${ this.countries[code] }`;
                });
                html += '</select>';
                return label + html;
            default:
                let autocomplete = this.AUTOCOMPLETE_OPTIONS[field.soort_invoer] ? this.AUTOCOMPLETE_OPTIONS[field.soort_invoer] : '';
                return label + `<input type="text" id="contactformulier-${ idx }" name="contactformulier${ idx }" ${ attrRequired } autocomplete="${ autocomplete }">`;
        }
    }

    showContactFormLabel(field, idx) {
        let labelText = field.naam;
        if (field.verplicht) {
            labelText += '<span title="Required">*</span>';
        }
        return `<label for="contactformulier-${ idx }">${ labelText }</label>`;
    }

    showDateTimeSelection() {
        let today = (new Date()).toISOString().substr(0, 10); // Formatted as 2018-03-13
        let html = `<div class="recras-datetime">`;
        html += `<label for="recras-onlinebooking-date">Date</label><input type="date" id="recras-onlinebooking-date" min="${ today }">`;
        html += '<label for="recras-onlinebooking-time">Time</label><input type="time" id="recras-onlinebooking-time">';
        html += '</div>';
        this.amendHtml(html);
    }

    showPackages(packages) {
        packages = packages.filter(p => {
            return p.mag_online;
        });
        let packagesSorted = this.sortPackages(packages);
        let options = packagesSorted.map(pack => {
            return `<option value="${ pack.id }">${ pack.weergavenaam || pack.arrangement }`;
        });

        let html = '<select id="recras-package-selection"><option>' + options.join('') + '</select>';
        this.setHtml(`<p>TODO: tekst pre</p>${ html }<p>TODO: tekst post</p>`);

        let packageSelectEl = document.getElementById('recras-package-selection');
        packageSelectEl.addEventListener('change', e => {
            let selectedPackageId = parseInt(packageSelectEl.value, 10);
            let selectedPackage = this.packages.filter(p => {
                return p.id === selectedPackageId;
            });
            if (selectedPackage.length === 0) {
                // Reset form
                this.showPackages(packages);
                return false;
            }
            this.selectedPackage = selectedPackage[0];
            this.showProducts(this.selectedPackage);
            this.showDateTimeSelection(this.selectedPackage);
            this.showContactForm(this.selectedPackage);
        });
    }

    showProducts(pack) {
        if (this.shouldShowBookingSize(pack)) {
            this.amendHtml(`<label for="bookingsize">${ (pack.weergavenaam || pack.arrangement) }</label><input type="number" id="bookingsize" min="0">`);
            let bookingSizeEl = document.getElementById('bookingsize');
            bookingSizeEl.addEventListener('input', e => {
                //TODO: updateProductAmounts
            });
        }
        let linesNoBookingSize = pack.regels.filter(line => {
            return line.onlineboeking_aantalbepalingsmethode !== 'boekingsgrootte';
        });

        let html = '<div class="recras-amountsform">';
        linesNoBookingSize.forEach((line, idx) => {
            html += '<div>';
            html += `<label for="packageline${ idx }">${ line.beschrijving }</label>`;
            //TODO: time, amount too low?, required products?
            html += `<input id="packageline${ idx }" type="number" min="0" max="${ line.max }">`;
            //TODO: updateProductAmounts
            html += '</div>';
        });
        html += '</div>';
        this.amendHtml(html);
    }
}