<?php
namespace Vella\Pay\Observer;

class CheckoutSuccessObserver implements \Magento\Framework\Event\ObserverInterface
{
    public function __construct()
    {
    }

    public function execute(\Magento\Framework\Event\Observer $observer)
    {
        // Get the order object from the observer
        $order = $observer->getEvent()->getData('order');

        // Disable the sending of the customer email
        $order->setCanSendNewEmailFlag(false);

        // Save the order to apply the changes
        $order->save();
    }
}