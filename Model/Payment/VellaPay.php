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

namespace Vella\Pay\Model\Payment;

class VellaPay extends \Magento\Payment\Model\Method\AbstractMethod
{

    protected $_code = "vellapay";
    protected $_isOffline = false;

    public function isAvailable(
        \Magento\Quote\Api\Data\CartInterface $quote = null
    ) {
        return parent::isAvailable($quote);
    }
}
