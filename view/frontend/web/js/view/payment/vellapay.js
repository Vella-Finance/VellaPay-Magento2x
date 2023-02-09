define(
    [
        'uiComponent',
        'Magento_Checkout/js/model/payment/renderer-list',
    ],
    function (
        Component,
        rendererList
    ) {
        'use strict';
        rendererList.push(
            {
                type: 'vellapay',
                component: 'Vella_Pay/js/view/payment/method-renderer/vellapay-method'
            }
        );
        return Component.extend({});
    }
);
