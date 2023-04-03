<?php
namespace Vendor\Module\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;

class DisableOrderPendingEmailNotification implements ObserverInterface
{
    public function execute(Observer $observer)
    {
        $order = $observer->getEvent()->getOrder();
        $order->setCanSendNewEmailFlag(false)
        ->setCustomerNoteNotify(false);
    }
}
