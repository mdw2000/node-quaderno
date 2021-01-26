const assert = require('assert');
const rewire = require('rewire');

const Quaderno = rewire('../');

describe('Quaderno', () => {
    describe('instantiation', () => {
        it('should throw an error if accountName is not provided', () => {
            assert.throws(() => {
                new Quaderno({
                    privateApiKey: '12345678',
                });
            }, /^Error: No accountName is provided$/);
        });

        it('should throw an error if privateApiKey is not provided', () => {
            assert.throws(() => {
                new Quaderno({
                    accountName: 'nonce',
                });
            }, /^Error: No privateApiKey is provided$/);
        });
    });

    describe('invoice', () => {
        it('should create an invoice', async () => {
            const client = new Quaderno({
                accountName: 'ninive-4990',
                privateApiKey: 'sk_test_WbnSHMkci7Czxj9f1Jc8',
            });

            const rsp = await client.invoices.create({
                    "contact": {
                        "first_name": "Tony",
                        "last_name": "Stark",
                        "email": "tony@tete.te",
                        "kind": "person", "contact_name": "Stark"
                    },
                    "po_number": "",
                    "currency": "USD",
                    "country": "NL",
                    "tag_list": "playboy, businessman",
                    "items_attributes": [
                        {
                            "description": "Whiskey",
                            "quantity": "1.0",
                            "unit_price": "20.0",
                            "discount_rate": "0.0",
                            "reference": "item_code_X"
                        }
                    ],
                    "custom_metadata": {
                        "a_custom_key": "a custom value"
                    }
                }
            );

            console.log(rsp);

        });
    });

});
