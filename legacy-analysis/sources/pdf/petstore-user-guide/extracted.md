<!-- anchor: p1 -->

Java™ Pet Store 1.3.2
User Guide
DocumentPS-UG-01
Version1.3.2
AudienceCustomers, order administrators and the supplier's stock clerk
Based onSun Microsystems, "Using the Demo", Java Pet Store Demo 1.3.2
1. The demo at a glance
ComponentWho uses itAddress
StorefrontCustomers place orders for petshttp://localhost:8000/petstore
Order Processing
Center (OPC)
No user interface. Receives orders from the
Storefront and approves, forwards and
completes them
-
SupplierStock clerk. Fulfils OPC orders from inventory
and invoices the OPC
http://localhost:8000/supplier/
AdminOrder administrator. Reviews pending orders
and approves or denies them
http://localhost:8000/admin/

2. Using the Storefront
2.1 Visiting the Storefront
Open http://localhost:8000/petstore in a browser. The home page lists the five categories: Fish,
Dogs, Reptiles, Cats and Birds. The page is available in English, Japanese and Chinese. The language
follows the browser setting and can be changed on the page.
2.2 Browsing and searching
Select a category to list its products, a product to list its items, and an item to see its detail. Lists show 2
rows at a time with Next and Previous. Type one or more words in the search box and press Search.
Search is not case-sensitive. It matches the product name, the category and the item description, and
shows items that match any of the words.
2.3 Item prices
The item page shows two prices.
List Price: the shelf price of the item.
Your Price: the discounted price for members.
2.4 Creating a new user
1. Click Sign In on the home page.
2. Fill out the form "I would like to sign up for an account" and click Create New Account.
3. Enter your account information and click Submit.
If this is your first visit, create a user before you make a purchase. The sample users j2ee and shopper
have the password j2ee.
2.5 Placing an order
To buy a bulldog:
1. On the home page select Dogs, then Bulldog.
2. Click Add to Cart in the row of the Male Adult Bulldog.
3. Click Check Out. A form for your billing and shipping information appears, already filled out for
the sample user.
4. Click Submit.
The Storefront sends the order to the OPC asynchronously. Because the order is less than $500, the
OPC approves it automatically. An e-mail about the order status is sent only if the administrator has
enabled notifications (see the Administration Guide).

3. Using the Admin client
3.1 Opening the client
Go to http://localhost:8000/admin/ and click Launch Rich Client. The client starts with Java Web
Start and shows two panes, one for pending and one for non-pending orders. The bulldog order from
section 2.5 is non-pending, because all orders under $500 are approved automatically.
3.2 Viewing non-pending orders
The View Non-Pending Orders panel shows orders that are approved, denied or completed. Click
Refresh to load them.
3.3 Approving or denying orders
An order is pending if its total value is greater than $500. In the Process Pending Orders panel:
1. Click the row of the order, then its Status cell.
2. Select a new status: approved or denied.
3. Repeat for as many orders as you wish, click Commit to save, then Refresh to see the changes.

4. Using the Supplier client
Log out of the Admin client first, then go to http://localhost:8000/supplier/.
4.1 Viewing and editing inventory
1. Click Display Inventory. A table shows the quantity of each item.
2. To change a quantity, edit the New Quantity cell of the item and tick its Update box.
3. Click Submit to write the changes to the database.
After every update the Supplier notifies the OPC. The OPC checks whether it can now fulfil orders it
could not fulfil before, and marks those orders completed.

5. Order status
StatusMeaning
PENDINGWaiting for the administrator to approve or deny
APPROVEDApproved and sent to the Supplier, not yet fully invoiced
DENIEDRefused by the administrator
COMPLETEDAll lines shipped and invoiced
