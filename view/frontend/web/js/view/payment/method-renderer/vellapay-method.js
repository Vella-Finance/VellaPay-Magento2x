/*browser:true*/
/*global define*/
/** 'Vella_Pay/js/sdk' */
define([
    "jquery",
    "Magento_Checkout/js/view/payment/default",
    "Magento_Checkout/js/action/place-order",
    "Magento_Checkout/js/model/payment/additional-validators",
    "Magento_Checkout/js/model/quote",
    "Magento_Checkout/js/model/full-screen-loader",
    "Magento_Checkout/js/action/redirect-on-success",
], function (
    $,
    Component,
    placeOrderAction,
    additionalValidators,
    quote,
    fullScreenLoader,
    redirectOnSuccessAction,
) {
    "use strict";

    return Component.extend({
        defaults: {
            template: "Vella_Pay/payment/vellapay",
            customObserverName: null
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

            $("head").append('<script src="https://checkout.vella.finance/widget/sdk.js" type="module"></script>');
            return this;
        },

        getCode: function () {
            return "vellapay";
        },

        getData: function () {
            return {
                method: this.item.method,
                additional_data: {}
            };
        },

        isActive: function () {
            return true;
        },

        /**
         * @override
         */
        afterPlaceOrder: function () {
            var checkoutConfig = window.checkoutConfig;
            var paymentData = quote.billingAddress();
            var vellaConfiguration = checkoutConfig.payment.vellapay;

            if (checkoutConfig.isCustomerLoggedIn) {
                var customerData = checkoutConfig.customerData;
                paymentData.email = customerData.email;
                paymentData.name = customerData.firstname + ' ' + customerData.lastname;
            } else {
                var storageData = JSON.parse(
                    localStorage.getItem("mage-cache-storage")
                )["checkout-data"];
                paymentData.email = storageData.inputFieldEmailValue;
                paymentData.name = paymentData.firstname + ' ' + paymentData.lastname;
                //paymentData.name = 'Test User';
                //console.log(checkoutConfig.totalsData)
            }

            var quoteId = checkoutConfig.quoteItemData[0].quote_id;

            var _this = this;
            _this.isPlaceOrderActionAllowed(false);

            var key = vellaConfiguration.test_key;
            if (vellaConfiguration.test_mode === 1) {
                key = vellaConfiguration.live_key;
            }

            var currency = 'NGNT';
            if (checkoutConfig.totalsData.quote_currency_code === 'NGN') {
                currency = 'NGNT'
            }
            else if (checkoutConfig.totalsData.quote_currency_code === 'USD') {
                currency = 'USDT'
            }
            else {
                currency = checkoutConfig.totalsData.quote_currency_code;
            }

            const config = {
                email: paymentData.email,
                name: paymentData.name, // string - customer name
                amount: quote.totals().grand_total, //float - amount to pay
                currency: currency,
                merchant_id: vellaConfiguration.merchant_id,
                reference: 'VE_MAGE_' + Math.floor((Math.random() * 1000000000) + 1), // string - your transaction reference
                source: 'magento',
                meta: [{
                    metaname: "QuoteId",
                    metavalue: quoteId
                },
                {
                    metaname: "Address",
                    metavalue: paymentData.street[0] + ", " + paymentData.street[1]
                },
                {
                    metaname: "Postal Code",
                    metavalue: paymentData.postcode
                },
                {
                    metaname: "City",
                    metavalue: paymentData.city + ", " + paymentData.countryId
                }],
            };
            const vellaSDK = VellaCheckoutSDK.init(key, config);
            vellaSDK.onSuccess(response => {

                if (response.data.status == "Successful" || response.data.status == "Completed") {
                    let base_url = 'https://sandbox.vella.finance/api/v1/checkout/transaction/' + response.data.reference + '/verify';
                    if (!vellaConfiguration.test_mode) {
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

                        $.ajax(settings).done(function (res) {
                            var chargeStatus = res.data.status;
                            var chargeAmount = res.data.amount;
                            var chargeCurrency = res.data.currency;

                            if ((chargeStatus == "Successful" || chargeStatus == "Completed") && (chargeAmount >= quote.totals().grand_total)) {
                                //Give Value and return to Success page
                                redirectOnSuccessAction.execute();
                                return;
                            } else {
                                _this.isPlaceOrderActionAllowed(true);
                                _this.messageContainer.addErrorMessage({
                                    message: "Error, please try again"
                                });
                            }
                        });
                    }, 1000);
                    // redirect to a success page

                }

                else {
                    _this.isPlaceOrderActionAllowed(true);
                    _this.messageContainer.addErrorMessage({
                        message: "Error, please try again"
                    });
                }
            })
            vellaSDK.onError(error => {
                console.log("error", error)
                _this.messageContainer.addErrorMessage({
                    message: "Error, Something went wrong"
                });
            });
            vellaSDK.onClose(() => {
                console.log("widget closed")
            });


        }
    });
});
