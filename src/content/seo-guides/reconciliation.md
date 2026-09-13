## Bank statement reconciliation in Excel starts with two records

Bank statement reconciliation in Excel compares the bank’s record of an account with your own ledger for the same account and cutoff date. The purpose is to explain differences, identify missing or duplicate entries, and establish which items remain outstanding. Converting a PDF gives you the bank-side data. It does not, by itself, reconcile that data with your books.

A bank statement and a ledger can both be accurate while showing different balances. You may record a payment before the bank clears it, or the bank may post a fee before you enter it. Reconciliation distinguishes timing differences from errors. It should leave a clear explanation of the remaining items rather than forcing the two unadjusted balances to match.

Use this guide to build a monthly review process for a deposit account. Credit card accounts use a different liability perspective and need their own sign convention. Keep separate accounts and currencies separate throughout the calculation. The fictional example below illustrates the logic; its numbers are not a template for anyone’s actual accounts.

## Information needed before starting

Gather the complete statement, the ledger or cash book for the same period, the prior reconciliation, and evidence for previously outstanding items. Include receipts, payment references, deposit records, and other supporting documents where relevant. Record the statement closing date and the ledger cutoff explicitly. Comparing different cutoff dates can produce a difference that is entirely expected.

Confirm that the ledger includes the correct account. Similar bank names, replacement accounts, and personal versus business accounts can make selection errors easy. Use a controlled alias and the account identifier available to the authorized reviewer. Do not combine two accounts because they belong to the same business; each requires its own reconciliation before any consolidated reporting.

If the statement is a PDF, [prepare the bank transactions in Excel](/blog/convert-bank-statement-pdf-to-excel) and validate the extraction first. A missing row in the conversion should be fixed in the bank-side working data before you investigate it as a ledger problem. Keep the original PDF available so you can distinguish extraction errors from genuine differences between records.

## Build a workbook with separate responsibilities

Create a Bank sheet containing reviewed statement activity and a Books sheet containing the ledger export. Add a Matches sheet or review columns for matching status, and a Reconciliation sheet for the adjusted balances. Keep source data unchanged where possible and place corrections or mapping decisions in clearly identified working columns. This makes the review understandable to someone else.

Recommended matching columns include account alias, source row ID, posting date, description, reference, debit, credit, signed amount, matched row ID, status, and review note. The bank’s reference and your ledger’s document number may differ, so keep both. Do not replace one identifier with the other simply to make a lookup formula easier.

Convert each dataset into an Excel table if that fits your workflow. Tables help formulas include newly added rows and make filters easier to use. Still check the actual data range before trusting a total. A manually selected range that ends above the last transaction can produce an apparently precise but incomplete reconciliation.

## A monthly reconciliation workflow

1. Verify the previous month’s reconciliation and bring forward its unresolved payments and deposits.
2. Validate the current bank extraction and ledger export, including account, currency, dates, and totals.
3. Normalize amount direction and dates in working columns while preserving source values.
4. Match straightforward one-to-one transactions using amount, reference, and a reasonable date relationship.
5. Investigate unmatched rows for timing differences, fees, interest, omissions, duplicates, and grouped settlements.
6. Record supported ledger adjustments, calculate adjusted balances, and document every remaining outstanding item.
7. Save the reviewed workbook with its evidence and carry open items into the next reconciliation.

Assign an owner to unresolved items. A note saying investigate later is difficult to follow next month. Record the item’s date, amount, evidence needed, responsible person, and expected next step. If a second reviewer checks the reconciliation, ask them to inspect the outstanding-item list and supporting adjustments as well as the final difference.

## Matching transactions by date and amount

Start with exact references and amounts where both records share them. When references differ, use the amount and a plausible date window to find candidates. The statement usually reflects posting or clearing, while the ledger may reflect when the payment was recorded. A one-day difference can be ordinary, but the appropriate window depends on the payment type and your records.

Use formulas to identify candidates, not to declare every match automatically. COUNTIFS can show that an amount appears several times. A lookup that returns only the first occurrence can assign two ledger rows to the same bank transaction. Add unique row identifiers and ensure each one-to-one match uses each source row only once.

For fictional ledger row B-104, a 75.00 payment may match several bank debits that week. Compare the payee, reference, and timing before choosing. If the evidence remains ambiguous, leave it unresolved. Matching the first available 75.00 row can make the overall balance look correct while linking the wrong transactions and hiding a missing payment.

## Handling timing differences

A payment recorded in your books may clear after the statement date. It remains outstanding at the cutoff and should be tracked until it appears on a later statement. Do not alter the statement date or move a real bank transaction into the wrong month to eliminate the difference. Reconciliation explains timing; it does not rewrite it.

A deposit in transit is similarly recorded in the books but not yet reflected by the bank at the cutoff. Confirm it using the deposit record and subsequent bank activity. An anticipated customer payment that has not actually been received is not automatically a deposit in transit. The evidence must support how the item was recorded.

Review the age of outstanding items. A payment that remains open for several months may need investigation into cancellation, reissue, entry error, or another cause. Do not carry it forward indefinitely without explanation. Follow your organization’s accounting policy for any adjustment, and preserve the reason rather than silently removing it from the list.

## Outstanding payments and deposits

List outstanding payments individually with reference, date, payee, amount, and evidence. Grouped totals are useful for the reconciliation summary, but the underlying details must remain available. When an item clears next month, mark it against the original outstanding entry instead of treating it as a newly discovered difference.

For deposits, preserve the link between individual receipts and any grouped bank deposit. A bank credit of 900.00 might represent three receipts of 300.00, or a settlement net of charges. Match the actual composition using supporting records. A sum that happens to equal the bank credit is not enough evidence that the selected receipts are the correct ones.

Transfers between your own accounts appear on both accounts’ statements. Reconcile each side to the relevant ledger account and consider timing differences between banks. In a consolidated cash-flow analysis, identify the transfer relationship so it is not counted as external income or spending. This classification is separate from whether each bank account reconciles.

## Bank fees and interest

Bank charges and interest often appear on the statement before the ledger is updated. Identify the printed transaction and check whether an entry already exists under another description. If it is missing, record the appropriate adjustment through your normal bookkeeping process, supported by the statement. The reconciliation worksheet should reference that adjustment rather than act as an unapproved replacement ledger.

Do not treat every unexplained small difference as a bank fee. A decimal error, text amount, duplicate transaction, or missing page can produce a similar difference. Locate the exact charge on the statement before recording it. Likewise, confirm whether an amount described as interest is a credit, a charge, or part of a separate account summary.

If a transaction appears to be a bank error, retain the original amount in the bank-side data and document the issue separately. Contact the bank through its normal process and track the resolution. Editing the extracted bank amount to your preferred value would erase the difference you need to investigate.

## Original example: two balances, one explained result

Imagine a fictional business with a bank closing balance of 4,820.00 and a book balance of 5,105.00 in the same currency. A 600.00 deposit is in transit, and a 350.00 payment has not cleared. The statement also shows a 40.00 fee and 5.00 interest credit missing from the books. These items explain the difference as follows.

| Reconciliation item | Bank side | Book side |
| --- | --- | --- |
| Unadjusted closing balance | 4,820.00 | 5,105.00 |
| Add deposit in transit | 600.00 | — |
| Subtract outstanding payment | -350.00 | — |
| Record bank fee | — | -40.00 |
| Record interest credit | — | 5.00 |
| Adjusted balance | 5,070.00 | 5,070.00 |

The adjusted bank side is 4,820.00 plus 600.00 minus 350.00. The adjusted book side is 5,105.00 minus 40.00 plus 5.00. Both equal 5,070.00. The two timing items remain on the outstanding list, while the missing fee and interest require supported book entries. None of these actions changes the bank-issued statement.

This example illustrates arithmetic, not a shortcut for classifying your differences. Each adjustment needs its own evidence. If an unexplained 35.00 remains, do not insert a balancing adjustment merely because that amount would make the worksheet agree. Find the underlying transactions or report the reconciliation as unresolved.

## Duplicate or missing transactions

Duplicates can enter through overlapping imports, repeated conversion runs, or a bank feed combined with a manual upload. Compare the reference, date, amount, and source history before deleting anything. Two identical card purchases can be legitimate. Mark suspected duplicates for review and identify which original record supports keeping or removing each copy.

Missing entries can arise in either dataset. Check whether the bank statement contains a section that was not extracted, whether the ledger export was filtered, and whether dates outside the selected range explain the difference. Look at the first and last few days of the period. A cutoff mismatch often appears there before it appears elsewhere.

For a grouped settlement, compare the gross receipts, fees, refunds, and net bank deposit using the settlement report. A single net amount may not match any individual ledger row. Document the many-to-one match and its components so the explanation can be reproduced. Avoid changing the source rows solely to make a one-to-one lookup succeed.

## Opening and closing balance checks

Validate the statement’s own movement before comparing it with the books. Opening balance plus credits minus debits should explain the closing balance under the account’s convention. If it does not, revisit the conversion, statement sections, and signs. This is a bank-data completeness check, distinct from the adjusted bank-versus-books reconciliation.

Check that the opening book balance agrees with the prior reconciled period and that outstanding items were carried forward correctly. A current-month difference can originate in an earlier adjustment or an altered opening balance. Do not solve an opening problem by changing a current transaction. Trace the difference to the period and record that created it.

Running balances can locate extraction mistakes, but not every bank presents them in chronological order. Keep the printed sequence during that check. For reconciliation summaries, use the correct statement closing balance rather than the last visible row after an arbitrary sort. Sorting changes presentation, not the cutoff value you are trying to reconcile.

When catching up on several months, [build a source-tracked consolidated workbook](/blog/convert-multiple-bank-statements-to-excel) before matching it with your ledger. Keep each monthly reconciliation independently explainable even if the transaction table covers a longer period.

## Output formats and retained evidence

Excel is useful for the reconciliation workbook because it holds source sheets, match identifiers, formulas, and outstanding-item details together. CSV is suitable for transferring a transaction list into an accepted workflow, but it does not preserve the workbook’s review structure. [Prepare CSV separately](/bank-statement-to-csv) if another application needs a narrow import file.

Retain the original statement, ledger extract, adjustment references, outstanding-item evidence, and reviewed workbook according to your organization’s requirements. The IRS’s [recordkeeping guidance](https://www.irs.gov/businesses/small-businesses-self-employed/what-kind-of-records-should-i-keep) lists supporting records relevant to US business transactions. The period and evidence appropriate to your own work depend on its purpose and applicable requirements.

Before closing the month, check that formulas include all rows, filters are understood, and the final difference is supported. State whether the reconciliation is complete or still has unresolved items. Use [the converter](/app) to prepare readable bank-side data, then perform the separate matching and accounting review that makes the reconciliation meaningful.

## Frequently asked questions

### What is a bank reconciliation?
It is a comparison of a bank account’s statement with your ledger at a defined cutoff. The process identifies matching transactions, explains timing differences, and investigates errors or omissions. A completed reconciliation documents supported adjustments and outstanding items rather than simply forcing the unadjusted balances to agree.

### How often should I reconcile?
A monthly cycle is a practical starting point because statements commonly cover monthly periods. Higher transaction volume or operational needs may justify more frequent checks. Keep the cutoff consistent and carry unresolved items forward so each review builds on the previous one instead of starting without context.

### Why do book and bank balances differ?
Common causes include uncleared payments, deposits in transit, fees, interest, missing entries, duplicate imports, and different cutoff dates. First verify the account and extraction. Then connect each difference to an identifiable transaction or supported timing item rather than assuming the discrepancy is an error.

### How do I find missing transactions?
Compare complete bank and ledger datasets using amounts, references, and dates, then investigate unmatched rows. Inspect page boundaries, filtered exports, and period cutoffs. A transaction can be absent from the spreadsheet extraction even though it appears on the PDF, so validate the bank-side data before changing your books.

### How do I handle bank fees?
Locate the exact fee on the statement and check whether it has already been recorded. If it is missing, make a supported ledger adjustment through your normal bookkeeping process and reference it in the reconciliation. Do not use a guessed fee to eliminate an unexplained difference.

### Can I reconcile multiple accounts?
Yes, but reconcile each account and currency separately before preparing consolidated summaries. Use stable account aliases and keep transfers identifiable on both sides. Combining accounts before checking their individual balances can conceal offsetting errors and makes outstanding payments or deposits harder to trace.

### Is a converted PDF enough for reconciliation?
It supplies a working version of the bank-side data, but you also need the ledger, the original statement, prior outstanding items, and relevant supporting evidence. Review the conversion first. A converter does not establish that your books contain the correct entries or that every difference has been resolved.

### What should I retain for audit purposes?
Keep the original statement, ledger extract, reconciliation workbook, adjustment references, outstanding-item details, and review evidence under your organization’s retention rules. Record source versions and unresolved issues clearly. Ask the responsible reviewer about specific requirements rather than assuming a spreadsheet alone is sufficient evidence.
