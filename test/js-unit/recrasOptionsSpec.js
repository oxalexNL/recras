describe('RecrasOptions', () => {
    describe('constructor options', () => {
        it('fails without options', () => {
            expect(() => {
                new RecrasOptions();
            }).toThrow();
        });

        it('fails without "element"', () => {
            expect(() => {
                new RecrasOptions({});
            }).toThrow(new Error('Optie "element" niet ingesteld.'));
        });

        it('fails with non-element "element"', () => {
            expect(() => {
                new RecrasOptions({
                    element: 'just a string',
                });
            }).toThrow(new Error('Optie "element" is geen geldig Element'));
        });

        it('fails without "recras_hostname"', () => {
            expect(() => {
                new RecrasOptions({
                    element: document.createElement('div'),
                });
            }).toThrow(new Error('Optie "recras_hostname" niet ingesteld.'));
        });

        it('fails with invalid "recras_hostname"', () => {
            expect(() => {
                new RecrasOptions({
                    element: document.createElement('div'),
                    recras_hostname: 'example.com',
                });
            }).toThrow(new Error('Optie "recras_hostname" is ongeldig.'));
        });
    });

    describe('isSinglePackage', () => {
        it('is true for an integer', () => {
            let options = new RecrasOptions({
                element: document.createElement('div'),
                recras_hostname: 'demo.recras.nl',
                package_id: 42,
            });
            expect(options.isSinglePackage()).toBe(true);
        });

        it('is true for a single-item array', () => {
            let options = new RecrasOptions({
                element: document.createElement('div'),
                recras_hostname: 'demo.recras.nl',
                package_id: [42],
            });
            expect(options.isSinglePackage()).toBe(true);
        });

        it('is false when left unspecified', () => {
            let options = new RecrasOptions({
                element: document.createElement('div'),
                recras_hostname: 'demo.recras.nl',
            });
            expect(options.isSinglePackage()).toBe(false);
        });

        it('is false for multi-item array', () => {
            let options = new RecrasOptions({
                element: document.createElement('div'),
                recras_hostname: 'demo.recras.nl',
                package_id: [17, 42],
            });
            expect(options.isSinglePackage()).toBe(false);
        });
    });

    describe('autoScroll', () => {
        it('is true if omitted', () => {
            let options = new RecrasOptions({
                element: document.createElement('div'),
                recras_hostname: 'demo.recras.nl',
            });
            expect(options.getAutoScroll()).toBe(true);
        });

        it('is true if specified', () => {
            let options = new RecrasOptions({
                autoScroll: true,
                element: document.createElement('div'),
                recras_hostname: 'demo.recras.nl',
            });
            expect(options.getAutoScroll()).toBe(true);
        });

        it('is false if specified', () => {
            let options = new RecrasOptions({
                autoScroll: false,
                element: document.createElement('div'),
                recras_hostname: 'demo.recras.nl',
            });
            expect(options.getAutoScroll()).toBe(false);
        });
    });

    describe('getAnalyticsEvents', () => {
        it('defaults to all events when an invalid option is passed', () => {
            let options = new RecrasOptions({
                element: document.createElement('div'),
                recras_hostname: 'demo.recras.nl',
                analyticsEvents: 'foo',
            });
            expect(options.getAnalyticsEvents().length).toBeGreaterThan(0);
        });

        it('defaults to all events when an empty array is passed', () => {
            let options = new RecrasOptions({
                element: document.createElement('div'),
                recras_hostname: 'demo.recras.nl',
                analyticsEvents: [],
            });
            expect(options.getAnalyticsEvents().length).toBeGreaterThan(0);
        });

        it('removes invalid events', () => {
            let options = new RecrasOptions({
                element: document.createElement('div'),
                recras_hostname: 'demo.recras.nl',
                analyticsEvents: ['foo', RecrasEventHelper.EVENT_BOOKING_BOOKING_SUBMITTED],
            });
            expect(options.getAnalyticsEvents()).toEqual([RecrasEventHelper.EVENT_BOOKING_BOOKING_SUBMITTED]);
        });
    });

    describe('getDefaultCountry', () => {
        it('accepts a given country code', () => {
            let options = new RecrasOptions({
                element: document.createElement('div'),
                recras_hostname: 'demo.recras.nl',
                defaultCountry: 'AU',
                locale: 'en_GB',
            });
            expect(options.getDefaultCountry()).toBe('AU');
        });

        it('falls back to locale country', () => {
            let options = new RecrasOptions({
                element: document.createElement('div'),
                recras_hostname: 'demo.recras.nl',
                locale: 'en_GB',
            });
            expect(options.getDefaultCountry()).toBe('GB');
        });
    });
});
