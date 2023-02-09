# VellaPay Magento 2x Module
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-) 

 Vella payment gateway Magento2 extension

Accept payment using Vella Checkout widget for Magento2

### [](https://github.com/Vella-Finance/VellaPay-Magento2x#installation) Installation

* Go to Magento2 root folder

* Enter following command to install module:

```bash
composer require vella/vellapay-magento2x
```


### Manual Installation

*  Click the Download Zip button and save to your local machine.
*  Unpack(Extract) the archive.
*  Create a __Vella/Pay__ folder in your Magento's __app/code__ directory.
*  Copy the content into your Magento's __app/code/Vella/Pay__ directory.

### Enable the Vella Payments module:

*  From your commandline, in your magento root directory, run
   
```bash
php bin/magento module:enable Vella_Pay --clear-static-content
php bin/magento setup:upgrade
php bin/magento setup:di:compile
```

*  Once the `setup:upgrade` completes the module will be available in the Store Admin.



### Configure the plugin

Configuration can be done using the Administrator section of your Magento store.

* From the admin dashboard, using the left menu navigate to __Stores__ > __Configuration__ > __Sales__ > __Payment Methods__.
* Select __VellaPay Payment Gateway__ from the list of recommended modules.
* Set __Enable__ to __Yes__ and fill the rest of the config form accordingly, then click __Save Config__ to save and activate.
  Note: Your Key and merchant ID is required to activate this module for cart checkout.

<img width="306" alt="vellapay admin" src="https://res.cloudinary.com/dm9otxkot/image/upload/v1675909535/Configuration-Settings-Stores-Magento-Admin_bz1hyg.png">

### Suggestions 
For issues and feature request, [click here](https://github.com/Vella-Finance/VellaPay-Magento2x/issues).
### License

##### GPL-3. See LICENSE.txt

### [](https://github.com/Vella-Finance/VellaPay-Magento2x#security) Security
If you discover any security related issues, please email hello@vella.finance instead of using the issue tracker.

