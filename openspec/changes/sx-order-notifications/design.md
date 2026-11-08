# Design notes: order-notifications (legacy implementation)

## User interface

No screen records were extracted for this capability; its user interface is unspecified.

## Legacy implementation notes

- The mailer component's message-driven bean (`MailerMDB`) parses a text message into a `Mail` (DTD: Address, Subject, Content) and hands it to `MailHelper`, which sends HTML via a JavaMail session looked up from JNDI (`mail/MailSession`) with X-Mailer "JavaMailer". Send failures are swallowed (a missing mail server is expected); parse/JMS errors are rethrown as EJBException.
- `AsyncSenderEJB` puts a text message on a configured queue; transaction attribute Required, no role restriction. Failures are raised to the caller.
- The OPC customer-relations beans (`MailOrderApprovalMDB`, `MailInvoiceMDB`, `MailCompletedOrderMDB`) each check a boolean env-entry (SendApprovalMail, SendConfirmationMail, SendCompletedOrderMail), default false in `conf/petstore.properties`, build the subject and render the body through a locale-specific XSL template.
- The storefront `OrderEJBAction` stores the bill-to e-mail on the order.
- Several records (INT-0001, INTEGRATION-0005, WORKFLOW-0007, REQ-0007) restate the same Mail DTD structure across passes; ORDNOT-REQ-0007 carries an unresolved-reachability dispute (DTD only, no consuming Java in that module).
- Queue destination name is bound at deploy time and not visible in source.
