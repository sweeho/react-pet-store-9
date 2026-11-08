<!-- anchor: p1 -->

Java™ Pet Store 1.3.2
Administration Guide
DocumentPS-AG-01
Version1.3.2
AudienceSystem administrators and build engineers
Based on
Sun Microsystems, "Installing", "Configuring" and "Building the Demo", Java
Pet Store Demo 1.3.2
1. System requirements
SoftwareVersion
Java 2 SDK, Standard Edition (J2SE)1.4.1 or higher
Java 2 SDK, Enterprise Edition (J2EE)1.3.1, includes the Cloudscape database
Set JAVA_HOME to the J2SE SDK and J2EE_HOME to the J2EE SDK, and add $JAVA_HOME/bin to PATH.

2. Installing
1. Unzip petstore-1_3_2.zip. The folder petstore1.3.2 is created (<petstore.home>).
2. Install and configure the message services and database resources: cd <petstore.home>; sh
setup.sh (Windows: setup.bat).
3. Start Cloudscape: cd $J2EE_HOME/bin; cloudscape -start.
4. Start the J2EE server: cd $J2EE_HOME/bin; j2ee -verbose.
5. Deploy the applications: cd <petstore.home>; sh setup.sh deploy.
The four applications are deployed from petstore.ear, opc.ear, supplier.ear and
petstoreadmin.ear. The context roots are /petstore, /opc, /supplier and /admin on port 8000.

3. Configuring
3.1 E-mail notifications
Notifications about order status are disabled by default. Enable them in src/apps/opc/src/ejb-
jar.xml by setting these env-entries to true:
Env-entryNotificationBean
param/SendApprovalMailOrder approvalMailOrderApprovalMDB
param/SendConfirmationMailOrder confirmationMailInvoiceMDB
param/SendCompletedOrderMailOrder completionMailCompletedOrderMDB
Then set the mail service in src/apps/opc/src/sun-j2ee-ri.xml: mail-from (From: address), mail-
host (mail server) and name (user name on the mail server). Rebuild the OPC EAR and redeploy. To
test, create a user with your e-mail address and complete an order.
3.2 Adding a localization
The Storefront is internationalised and comes with the English (en) and Japanese (ja) localizations. To
add another:
1. Add JSP pages for the locale in src/apps/petstore/src/docroot/<locale.code>/.
2. Add screendefinitions_<locale.code>.xml to docroot/WEB-INF.
3. Add data for the locale to docroot/populate/Populate-UTF8.xml. CategoryDetails,
ProductDetails and ItemDetails take an xml:lang attribute.
3.3 Using another database
The Storefront and Supplier use Cloudscape by default. For another database:
1. Copy the cloudscape entry of populate/PopulateSQL.xml (create, insert, drop and check
statements per table) and give it a new database identifier.
2. Copy the cloudscape entry of CatalogDAOSQL.xml (the select statements) and give it the same
identifier.
3. Set the identifier in WEB-INF/web.xml of the Storefront (param/CatalogDAODatabase and the
populate Database parameter).
Tables of the OPC and Supplier entity beans are created by the J2EE server at deployment. They
are not part of PopulateSQL.xml.

4. Building
Ant 1.4.1 is bundled. The bundle also holds pre-built EAR files, so building is optional.
Set these properties in src/build.properties:
PropertyMeaningExample
j2ee.server.nameHost of the J2EE SDKlocalhost
j2ee.server.portHTTP port of the J2EE SDK8000
j2ee.homeJ2EE SDK folder~/j2sdkee1.3.1
j2ee-script-suffixSuffix of J2EE scriptsnone (Unix), .bat (Windows)
jwsdp-script-suffixSuffix of JWSDP scripts.sh (Unix), .bat (Windows)
Run build.sh [target] in <petstore.home>/src. Targets: core (default, builds everything), clean,
deploy, undeploy, verify (J2EE verifier), docs (Javadoc). To build one application run the script in
src/apps/<app>/src, where app is petstore, opc, supplier or admin. EAR files are written to
src/apps/<app>/build.
