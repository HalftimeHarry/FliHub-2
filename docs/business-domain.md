# FLIHub Business Domain

FLIHub Business is the organizational and commercial operating system for internal company operations and future commercial capabilities.

## Initial boundary

The current proof of concept recognizes `Organization -> Department -> Project -> ReimbursementClaim`. Reimbursements use `ExpenseItem` and shared `Money` value objects.

## Future operations capabilities

Future concepts include Department, Project, Reimbursement, ReimbursementClaim, ExpenseItem, Vendor, Budget, Employee or Staff assignment, Project membership, Department membership, approval workflows, project expenses, department expenses, and financial reporting.

## Future commercial capabilities

Commercial capabilities should remain in Business and may include Sponsor, Advertiser, Campaign, SponsorshipOpportunity, Contract, MediaRights, MediaLicense, Invoice, Payment, and Analytics.

## Future reimbursement workflow

A future production workflow can expand the current proof of concept:

Raw reimbursement request -> Validate input -> Resolve claimant -> Resolve department -> Resolve project if applicable -> Validate expense items -> Calculate claim total -> Submit for review -> Approve or reject -> Mark for payment.

This should continue to use the same lightweight pipeline architecture as League workflows.
