<?php

namespace Vella\Pay\Controller\Payment;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Request\Http;
use Magento\Sales\Model\Order;
use Magento\Framework\Webapi\Exception;
use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\Framework\App\Action\Context;

class Webhook extends Action
{

   /*  protected $orderRepository;
    protected $context;

    public function __construct(
        Context $context,
        OrderRepositoryInterface $orderRepository
    ) {
        $this->context = $context;
        $this->orderRepository = $orderRepository;
    } */

    public function execute()
    {

        $logger = \Magento\Framework\App\ObjectManager::getInstance()->get(\Psr\Log\LoggerInterface::class);



        // Get request payload
        $request = $this->getRequest();

        $event = json_decode($request->getContent(), true);
       

        if ('transaction.completed' == $event['type']) {

   

            $order_details = explode('_', $event['data']['reference']);


            // Get order ID from payload
            $temporaryOrderId = (int) $order_details[0];


            $objectManager = \Magento\Framework\App\ObjectManager::getInstance();
            $searchCriteriaBuilder = $objectManager->create('Magento\Framework\Api\SearchCriteriaBuilder');
            $searchCriteria = $searchCriteriaBuilder->addFilter('quote_id', $temporaryOrderId, 'eq')->create();
            $orderRepository = $objectManager->create('Magento\Sales\Api\OrderRepositoryInterface');
            $items = $orderRepository->getList($searchCriteria);
            if ($items->getTotalCount() == 1) {
                $order = $items->getFirstItem();
            }

            
            // Load order by ID
            //$order = $this->_objectManager->create(Order::class)->loadByIncrementId($newOrderId);

            $orderId = $order->getId();


            if (strtolower($event['data']['status']) !== "successful" && strtolower($event['data']['status']) !== "completed") {
                $logger->debug("payment is not successful");
                die("payment not successful for  order :'{$orderId}' .");
            }

            // Check if order exists
            if (!$order || !$order->getId()) {
                die("Order with ID '{$orderId}' not found.");
            }

            // Check if order is already complete
            if ($order->getState() === Order::STATE_COMPLETE) {
                die("Order with ID '{$orderId}' has already been completed.");
            }

            if ($order->getState() === Order::STATE_PROCESSING) {
                die("Order with ID '{$orderId}' has already been in processing.");
            }

            


            // Set order status and state to 'complete'
            $state = Order::STATE_PROCESSING;
            $status = 'processing';
            $comment = __('Payment authorized via Vellapay.');

            $order->setState($state);
            $order->setStatus($status);
            $order->addCommentToStatusHistory($comment);
            $order->save();

            return $this->getResponse()->setBody('Order updated.');
        } else {
            return $this->getResponse()->setBody('nothing to do');
        }
    }
}
