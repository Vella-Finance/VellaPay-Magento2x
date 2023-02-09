<?php

/**
 * VellaPay Payment gateway for accepting fait, crypto, credit card, debit card and bank account payment on you store
 * Copyright (C) 2023
 *
 * This file is part of Vella/Pay.
 *
 * Vella/Pay is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

namespace Vella\Pay\Model\Ui;

use Magento\Checkout\Model\ConfigProviderInterface;
use Magento\Framework\App\Config\ScopeConfigInterface;

/**
 * Class ConfigProvider
 */
final class ConfigProvider implements ConfigProviderInterface
{

  public function __construct(
    ScopeConfigInterface $scopeConfig
  ) {
    $this->scopeConfig = $scopeConfig;
    $this->scopeStore = \Magento\Store\Model\ScopeInterface::SCOPE_STORE;
  }

  /**
   * Retrieve assoc array of checkout configuration
   *
   * @return array
   */
  public function getConfig()
  {
    $live_key = $this->scopeConfig->getValue('payment/vella/live_key', $this->scopeStore);
    $test_key = $this->scopeConfig->getValue('payment/vella/test_key', $this->scopeStore);
    $api_url = 'https://api.vella.finance/';
    //$modal_title = $this->scopeConfig->getValue('payment/vella/modal_title', $this->scopeStore);
    //$modal_desc = $this->scopeConfig->getValue('payment/vella/modal_desc', $this->scopeStore);
    //$logo = $this->scopeConfig->getValue('payment/vella/logo', $this->scopeStore);
    $country = $this->scopeConfig->getValue('payment/vella/country', $this->scopeStore);
    $merchant_id = $this->scopeConfig->getValue('payment/vella/merchant_id', $this->scopeStore);
    $payment_method = $this->scopeConfig->getValue('payment/vella/payment_method', $this->scopeStore);
    $test_mode = $this->scopeConfig->getValue('payment/vella/test_mode', $this->scopeStore);
    if ($this->scopeConfig->getValue('payment/vella/test_mode', $this->scopeStore)) {
      $test_key = $this->scopeConfig->getValue('payment/vella/test_key', $this->scopeStore);
      //$secret_key = $this->scopeConfig->getValue('payment/vella/test_secret_key', $this->scopeStore);
      $api_url = 'https://sandbox.vella.finance/';
    }

    return [
      'payment' => [
        'vellapay' => [
          'live_key' => $live_key,
          // 'modal_title' => $modal_title,
          //'modal_desc' => $modal_desc,
          'test_key' => $test_key,
          'api_url' => $api_url,
          'test_mode' => $test_mode,
          'country' => $country,
          'merchant_id' => $merchant_id,
          'payment_method' => $payment_method,
        ]
      ]
    ];
  }
}
