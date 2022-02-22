# eMAG Integration

eMAG is the largest Romanian marketplace and one of the largest retailers in Eastern Europe. This app allows VTEX store owners to list their products on the eMAG marketplace but also to synchronize catalogs, orders, and warehouses, as well as establish maximum and minimum sales prices for promotions and set handling times for orders.

## Main Features:

- Directly integrates with the eMAG marketplace,
- Allows you to synchronize catalogs, orders, and warehouses with eMAG,
- Allows you to send and receive AWB codes from eMAG,
- Allows you to set handling times for orders,
- Allows you to establish minimum and maximum sales prices

## Configuration

This app is destined for VTEX store owners that already have an eMAG Marketplace seller account and want to integrate their store with it.

### Step 1: Fill in the app settings

1. Username - eMAG Marketplace account name
2. Password - eMAG Marketplace account password
3. Trade Policy ID - trade policy for the eMAG Affiliate. It will identify products that will be sent to the marketplace
4. Store Domain - VTEX store domain (example: zitec.myvtex.com)
5. Affiliate Id - configured in VTEX
6. App Token - generated from VTEX
7. App Key - generated from VTEX
8. Max Sale Price - percentage used to calculate the maximum price an item will be sold for in eMAG Marketplace
9. Min Sale price - percentage used to calculate the minimum price an item will be sold for in eMAG Marketplace
10. Concatenate brand to name - If checked, in eMAG the product name will be concatenated with the brand
11. Value to concatenate with product name - Text that will be added to the product name in eMAG
12. Handling Time - Duration (in days) to prepare an order
13. Value to concatenate with SKU ID - Number that will be added to the SKU ID to generate the eMAG Marketplace Product ID. If empty, the ID in eMAG will be the SKU ID.
14. Warehouses - Warehouses that will be taken into consideration for eMAG. If empty, it will consider all warehouses.
15. Sender Name - It will be used to generate the AWB.
16. Sender Phone - It will be used to generate the AWB.
17. Sender Street - It will be used to generate the AWB.
18. Sender Locality Id - It will be used to generate the AWB. In order to fill in this field you need to accesss the document [here](https://docs.google.com/spreadsheets/d/1Co9rfyzngkQ7E17Tvv5loaK3YqOuliEsJz5CDH7_7i4/edit?usp=sharing) and find the emag_id that matches your locality.
19. Oversized shipping - If checked, the courier will be notified that your package is oversized.
20. Saturday delivery - If checked, delivery will be possible on saturdays.
21. Sameday delivery - If checked, delivery will be possible in the same day an order was placed.

### Step 2: Install

After filling in the settings, go to the **Logs** section and click the _Install_ button.

### Step 3: Configure an affiliate and sales channel

Keep in mind that only the sales channel configured for the affiliate will be taken into consideration when sending products to eMAG Marketplace.

### Step 4: Shipping policy and loading dock

You will need to configure a shipping policy for eMAG by filling in the field "Shipping Method" with the value "eMAG"
You will also need to configure a loading dock that points to the sales channel for the eMAG affiliate.

### Step 5: Category Mapping

Before sending products to eMAG you will need to map the VTEX categories to eMAG categories. This can be done by accessing the **Category Mapping** menu. For every VTEX category you will need to select the equivalent in eMAG, filling in the specifications and attribute values, where possible.

### Step 6: Products. Product Status List

For a product to be sent to the eMAG Marketplace, it must be in the sales channel configured for the affiliate. Every time you update a product, a SKU, the stock or the price of an item, the connector will also send the new data to eMAG.
In order to be accepted in eMAG, you will need to fill in the _Reference Code_ with the _Part Number_ (manufacturer unique code) of the item.
If you want to send an offer to an existing eMAG Product, you will have to fill in the _Manufacturer Code_ in the SKU Form with the _Part Number Key_ of the eMAG Product.

The products that have been sent to the marketplace can be found in the **Product Status List** section. Every product has a status that gives information about the process:

- In Sync - the process is in progress
- VTEX Error - there was an error on configuring the product for eMAG
- eMAG Upload Error - there was an error while sending the product to eMAG
- eMAG Pending - the product was sent successfully and awaits validation
- eMAG Validation Error - the product was sent successfully but was not validated by eMAG
- Success - the product was sent successfully and validated by eMAG

### Step 7: Orders

The orders originating from eMAG can be seen in the VTEX Order Section. The Origin field will have the value _Fulfillment_ and the order ID will contain the affiliate ID.

### Step 8: Logs

In order to track the connector processes in real time you can access the logs, where you can search and filter entries.

The log types are:

- Mapping - process that maps the categories and specifications
- Product Notify - process that sends product data to eMAG
- Order Notify - process that notifies the connector that an order was placed in eMAG
- Order Status Change - process that notifies that an order status has been modified
- Install - connector installation process
