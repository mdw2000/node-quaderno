const fetch = require("node-fetch");

const url = require('url');
const resources = require('./resources');
const QuadernoError = require('./errors/error');

class Quaderno {
    constructor(options) {
        this.validateOptions(options);
        this.baseUrlObject = this.getBaseUrlObject(options);

        this.contacts = new resources.Contacts(this);
        this.receipts = new resources.Receipts(this);
        this.invoices = new resources.Invoices(this);
        this.credits = new resources.Credits(this);
        this.expenses = new resources.Expenses(this);
        this.estimates = new resources.Estimates(this);
        this.recurring = new resources.Recurring(this);
        this.items = new resources.Items(this);
        this.payments = new resources.Payments(this);
        this.taxes = new resources.Taxes(this);
        this.evidence = new resources.Evidence(this);
        this.webhooks = new resources.Webhooks(this);
    }

    /**
     * Validate the provided options object against certain rules.
     * The `accountName` and `privateApiKey` properties have
     * mandatory String values.
     * @param {Object} [options] Quaderno init options.
     */
    validateOptions(options) {
        const {accountName, privateApiKey, token} = options;

        if (token) {
            if (typeof token !== 'string') {
                throw new Error('Token must be a string value');
            }
        } else {
            if (!accountName || typeof accountName !== 'string') {
                throw new Error('No accountName is provided');
            }
            if (!privateApiKey || typeof privateApiKey !== 'string') {
                throw new Error('No privateApiKey is provided');
            }
        }
    }


    /**
     * Returns an object containing URL information (a {@link urlObject})
     * which can be provided to {@link url.format()} to retrieve a
     * formatted URL string derived from the {@link urlObject}.
     * @param {Object} [options] Quaderno constructor options.
     * @return {Object}
     */
    getBaseUrlObject(options) {
        const sandbox = options.sandbox;
        if (options.token) {
            return {
                auth: `Bearer ${token}`,
                protocol: sandbox ? 'http' : 'https',
                hostname: `${sandbox ? 'sandbox-' : ''}quadernoapp.com/api`,
            };
        } else {
            const sandbox = /sk_test/.test(options.privateApiKey);
            return {
                auth: 'Basic ' + Buffer.from(`${options.privateApiKey}:x`).toString('base64'),
                protocol: sandbox ? 'http' : 'https',
                hostname: `${options.accountName}.${sandbox ? 'sandbox-' : ''}quadernoapp.com/api`,
            };
        }
    }

    /**
     * @param {Object} [urlObject] A URL object (as returned
     * by {@link url.parse()} or constructed otherwise).
     * @return {String} A formatted URL string derived from
     * {@link urlObject}.
     */
    url(urlObject) {
        return url.format({
            ...this.baseUrlObject,
            ...urlObject,
        });
    }

    /**
     * @param {String} [method] The HTTP request method
     * @param {Object} [urlObject] A URL object (as returned
     * by url.parse() or constructed otherwise).
     * @param {Object} [body]
     * @param {HTTPStatusCode} [successCode] The HTTP status code that
     * signifies a successful request.
     * @return {Promise} The response from the API.
     */
    async dispatch(method, urlObject, body, successCode = 200) {
        const rsp = await fetch(this.url(urlObject), {
            method: method.toLowerCase(),
            headers: {
                "Authorization": this.baseUrlObject.auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });
        const response = await rsp.json();
        if (rsp.status !== successCode) {
            throw (new QuadernoError(response));
        }
        return response;
    }

    /**
     * @param {String} [pathname]
     * @param {Object} [body]
     * @return {Promise} The response from the API.
     */
    post(pathname, body) {
        const urlObject = {pathname};
        return this.dispatch('POST', urlObject, body, 201);
    }

    /**
     * @param {String} [pathname]
     * @return {Promise} The response from the API.
     */
    get(pathname, query) {
        const urlObject = {pathname, query};
        return this.dispatch('GET', urlObject, undefined, 200);
    }

    /**
     * @param {String} [pathname]
     * @param {Object} [body]
     * @return {Promise} The response from the API.
     */
    put(pathname, body) {
        const urlObject = {pathname};
        return this.dispatch('PUT', urlObject, body, 201);
    }

    /**
     * @param {String} [pathname]
     * @return {Promise} The response from the API.
     */
    delete(pathname) {
        const urlObject = {pathname};
        return this.dispatch('DELETE', urlObject, undefined, 204);
    }
}

module.exports = Quaderno;
