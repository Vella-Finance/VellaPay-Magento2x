/*browser:true*/
/*global define*/
/** 'Vella_Pay/js/sdk' */
define([
    'jquery',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/url-builder',
    'Magento_Customer/js/customer-data',
    'Magento_Checkout/js/view/payment/default',
    'Magento_Checkout/js/model/payment/additional-validators',
    'mage/storage',
    'mage/url',
    'Magento_Checkout/js/model/full-screen-loader',
    'Magento_Checkout/js/action/place-order',
    'Magento_Customer/js/model/customer'
], function (
    $,
    quote,
    urlBuilder,
    customerData,
    Component,
    additionalValidators,
    storage,
    urlFormatter,
    fullScreenLoader,
    placeOrderAction,
    customer,
    redirectOnSuccessAction
) {
    "use strict";

    return Component.extend({
        config: window.checkoutConfig,
        defaults: {
            template: "Vella_Pay/payment/vellapay",
            customObserverName: null,
            paymentMethodNonce: null,
        },

        redirectAfterPlaceOrder: false,

        initialize: function () {
            this._super();


            var c = document.createElement("div");
            c.id = "vew-widget";
            document.body.appendChild(c);
            // Add vella Gateway script to head
            var checkoutConfig = window.checkoutConfig;
            var vellaConfiguration = checkoutConfig.payment.vellapay;

            const endpoint = vellaConfiguration.api_url;
            var t = document.createElement("script");
            t.setAttribute("src", "https://checkout.vella.finance/widget/sdk.js"),
                t.setAttribute("type", "module");
            t.setAttribute("id", "vella-checkout-module");
            document.head.appendChild(t);
            
            setTimeout(() => {
                if (!this.config.isCustomerLoggedIn) {
                    var storageData = JSON.parse(
                        localStorage.getItem("mage-cache-storage")
                    )["checkout-data"];
                   
                    localStorage.setItem("vellaguestdata", JSON.stringify(storageData))
                }
            }, 100);
            
            return this;
        },

        getCode: function () {
            return "vellapay";
        },


        getCustomerInfo: function () {
            var customerName, email, lastName, firstName;
            if (this.config.isCustomerLoggedIn) {
                var customerInfo = this.config.customerData;
                email = customerInfo.email;
                firstName = customerInfo.firstname;
                lastName = customerInfo.lastname;
                customerName = customerInfo.firstname + ' ' + customerInfo.lastname;
            } else {

                var guestData = localStorage.getItem("vellaguestdata");
                var storageData = JSON.parse(guestData);
                email = storageData.validatedEmailValue;
                firstName = storageData.shippingAddressFromData.firstname;
                lastName = storageData.shippingAddressFromData.lastname;
                customerName = firstName + ' ' + lastName;

            }

            return {
                email,
                firstName,
                lastName,
                customerName
            }

        },
        getData: function () {
            return {
                method: this.getCode(),
                additional_data: {
                    'payment_method_nonce': this.paymentMethodNonce
                }
            };

        },
        getGrandTotal: function () {
            if (totals.totals()) {
                var grandTotal = parseFloat(totals.totals()['grand_total']);
                return grandTotal;
            }
        },
        /**
             * Get order total amount
             *
             * @returns {number}
             */
        getOrderTotal: function () {
            var quote = window.checkoutConfig.quoteData;
            return quote.base_grand_total;
        },
        isActive: function () {
            return true;
        },
        getQuoteCurrency: function () {
            return this.config.quoteData.quote_currency_code;

        },
        /**
             * Set payment nonce
             * @param {String} paymentMethodNonce
             */
        setPaymentMethodNonce: function (paymentMethodNonce) {
            this.paymentMethodNonce = paymentMethodNonce;
        },

        /**
         * Prepare data to place order
         * @param {Object} data
         */
        beforePlaceOrder: function (data) {
            this.setPaymentMethodNonce(data.nonce);
        },
        makePayment: function (data, event) {
            var self = this;

            fullScreenLoader.startLoader();
            var checkoutConfig = window.checkoutConfig;
            document.getElementById("vellapaybutton").disabled = true;
            $("#vellapaybutton").text('processing...');

            //var paymentData = quote.billingAddress();
            var vellaConfiguration = checkoutConfig.payment.vellapay;

            var quoteId = checkoutConfig.quoteItemData[0].quote_id;

            //console.log(quoteId)

            var _this = this;
            //_this.isPlaceOrderActionAllowed(false)


            let key, base_url;
            if (vellaConfiguration.test_mode === '1' || vellaConfiguration.test_mode === 1) {
                key = vellaConfiguration.test_key;
            } else {
                key = vellaConfiguration.live_key;
            }

            var currency = this.getQuoteCurrency();

            if (currency === 'USD') {
                currency = 'USDT'
            }

            var totalAmount = Math.ceil(quote.totals().grand_total);

            const config = {
                email: this.getCustomerInfo().email,
                name: this.getCustomerInfo().customerName, // string - customer name
                amount: totalAmount, //float - amount to pay
                currency: currency,
                merchant_id: vellaConfiguration.merchant_id,
                reference: quoteId + '_VEMAGE' + Math.floor((Math.random() * 1000000000) + 1), // string - your transaction reference
                source: 'magento',
                meta_data: [{
                    metaname: "QuoteId",
                    metavalue: quoteId
                },
                ],
            };
            const vellaSDK = VellaCheckoutSDK.init(key, config);
            vellaSDK.onSuccess(response => {

                // if (response.status == "Successful" || response.status == "success" || response.status == "Completed") {

                if (vellaConfiguration.test_mode === '1' || vellaConfiguration.test_mode === 1) {
                    base_url = 'https://sandbox.vella.finance/api/v1/checkout/transaction/' + response.data.reference + '/verify';
                } else {
                    base_url = 'https://api.vella.finance/api/v1/checkout/transaction/' + response.data.reference + '/verify';
                }

                var settings = {
                    "url": base_url,
                    "method": "GET",
                    "timeout": 0,
                    "headers": {
                        "Authorization": "Bearer " + key
                    },
                };
                setTimeout(() => {
                    //_this.isPlaceOrderActionAllowed(true);
                    $.ajax(settings).done(function (res) {
                        var chargeStatus = res.data && res.data.status;
                        var chargeAmount = res.data && res.data.amount;

                        if (!chargeStatus || !chargeAmount) {
                            // Handle missing data in the response
                            return _this.messageContainer.addErrorMessage({
                                message: "Missing payment details"
                            });
                        }

                        // var chargeCurrency = res.data.currency;
                        document.getElementById("vellapaybutton").disabled = false;
                        $("#vellapaybutton").text('Pay Now');
                        if (chargeStatus.toLowerCase() === "successful" || chargeStatus.toLowerCase() === "completed") {
                            
                            localStorage.removeItem("vellaguestdata")
                            window.location.href = window.BASE_URL + 'checkout/onepage/success';

                            return;

                        } else {
                            _this.resetPaymentError("awaiting payment confirmation");
                        }
                    }).fail(function () {
                        _this.resetPaymentError("Unable to retrieve payment details")
                    });
                }, 1000);
                // redirect to a success page


            })
            vellaSDK.onError(error => {
                console.log("error", error)
                _this.resetPaymentError("Error, Something went wrong with payment")
            });
            vellaSDK.onClose(() => {
                _this.resetPaymentError("payment widget closed")
            });


        },

        /**
        * @override
        */
        afterPlaceOrder: function () {

            this.makePayment();

        },
        resetPaymentError: function (message) {
            fullScreenLoader.stopLoader();
            console.log(message)
            this.messageContainer.addErrorMessage({
                message: message
            });
            $("#vellapaybutton").text('Pay Now');
            document.getElementById("vellapaybutton").disabled = false;
        }
    });
});