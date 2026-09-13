## Scanned bank statement to Excel: begin with the page image

Converting a scanned bank statement to Excel is a recognition task before it is a spreadsheet task. The software must identify printed characters in an image, associate them with the right transaction, and place them into usable columns. Each stage can introduce a different problem. A readable merchant name does not prove that a faint decimal point was recognized correctly.

Start by looking for a digital statement download from the bank. A paper scan may be the only available record, but the original digital PDF often provides clearer text and better layout information. If you must use a scan, retain the original image file and improve a working copy. That preserves a reference if image adjustments remove useful detail.

StatementToExcel includes an OCR path for scanned material and a transaction review workflow. Treat its output as a draft to compare with the image. This guide explains how to improve the input, recognize common failure patterns, and decide when manual correction is necessary. It does not assume every scan is readable or that recognition errors will always be flagged automatically.

## Text PDF versus image-only PDF

A text PDF contains characters that software can often select and extract directly. An image-only PDF contains a picture of the page, much like a photograph in a document wrapper. Both look similar on screen. Changing the filename from .jpg to .pdf does not create selectable text or a transaction table; a proper conversion only packages the image into a PDF.

Some PDFs contain both a page image and an invisible OCR text layer. These files may allow selection even when the text layer is inaccurate. Others contain digital text on one page and scans on another. Check several pages rather than assuming the entire file uses the same representation. Mixed files deserve especially careful page-by-page coverage checks.

If the document already has accurate selectable text, use the ordinary [bank statement PDF extraction method](/blog/convert-bank-statement-pdf-to-excel). Running OCR unnecessarily can introduce character substitutions that were absent from the digital source. The best route is the one that preserves the original information with the fewest avoidable transformations.

## Check whether the PDF has selectable text

Open the file in a trusted PDF viewer and drag across a transaction date. Copy it into a plain text editor, then repeat with an amount and a multi-line description. If the selection behaves like a rectangular picture or produces nothing, the document probably needs recognition. If it produces text, compare that text with the visible page.

Look for garbled characters, wrong reading order, and missing punctuation. A text layer might recognize the digits but place the debit amount next to the following row. It may also copy a balance before a transaction because of the original drawing order. Selectable text establishes that characters are present; it does not establish that table structure has survived.

Check the smallest amount and a row near a page edge. Recognition can be good in the center and poor near a curled margin. Note which pages are image-only, which contain usable text, and which need repair. A simple page inventory makes it easier to explain why one part of a conversion needs closer review than another.

## How OCR reads a scanned statement

OCR estimates characters from visual patterns. A transaction extractor then needs to associate those characters with rows and fields such as date, description, debit, credit, and balance. On a tightly printed statement, the space between columns may be small. A slightly tilted page can make a value appear closer to the wrong row or column.

Recognition systems may use surrounding context to interpret a character. Context helps with ordinary words, but financial values must still match the source exactly. A plausible salary amount is not acceptable if the printed amount differs. Treat any generated description or suggested category as something to verify, especially when the source is faint or partially obscured.

StatementToExcel’s OCR implementation uses server-side processing with an external AI service. It should not be described as a browser-only OCR tool. If a document is subject to restrictions on external processing, resolve those requirements before uploading. The same decision applies to other recognition services you might use to prepare a searchable PDF.

If external processing affects your decision, use the [converter privacy assessment guide](/blog/secure-bank-statement-pdf-converter) to identify the questions that need answers before submitting a scan.

## Scan quality, resolution, alignment, and contrast

Capture the entire page with all transaction columns and page numbers visible. For paper scanning, around 300 dpi is a common starting point for ordinary printed text, but readability matters more than a nominal resolution setting. Inspect the resulting image at a normal reading size and zoom into small digits. A high-resolution scan of an out-of-focus source can still be unusable.

Keep the page flat and straight. Photographs taken at an angle compress one side of the table and can misalign rows. Avoid shadows from your hand or phone, glare from glossy paper, and folds through the amount columns. If you use a phone, hold it parallel to the page and inspect the result before photographing the next page.

Moderate contrast adjustments can help faint text, but aggressive thresholding can erase decimal points and minus signs. Do not crop tightly around the transaction body if that removes dates, headings, or balance context. Compare the adjusted copy with the original image, especially near the edges and in areas containing pale print.

Avoid repeatedly compressing or resaving images through messaging apps. Compression artifacts can make an 8 resemble a 3 or obscure punctuation. Prefer a direct scan or original photograph stored in a suitable document format. If a file is too large for the current workflow, split it into logical page ranges while recording the order and statement identity.

## A step-by-step OCR workflow

1. Inventory the statement pages, account alias, period, and printed opening and closing balances before recognition.
2. Inspect each image for missing edges, rotation, blur, glare, and faint amount columns. Rescan defective pages where possible.
3. Select the OCR workflow and submit only documents you are authorized to process under your data-sharing requirements.
4. Compare extracted sections with the source page inventory so that a clean-looking preview does not hide an omitted page.
5. Review every monetary field and date, then repair descriptions and references using the page image as evidence.
6. Export a reviewed workbook, calculate control totals, and keep a list of unresolved readings rather than guessing.

Use an account alias in your review notes and keep page references precise. An entry such as page 4, second withdrawal after the heading is much more helpful than a note saying OCR wrong. If the app does not provide a confidence indicator or source-page link, create your own review notes in the workbook. Do not assume an unflagged row has been verified.

## Common OCR errors in dates and amounts

Characters with similar shapes are a predictable source of mistakes: zero and the letter O, one and lowercase l, or five and S. Small punctuation is equally important. The amount 90.08 can become 9008 if the decimal point disappears. A missing negative sign can turn a withdrawal into an apparent deposit when the output uses signed amounts.

Dates can be misread as plausible but incorrect dates. For example, a faint 8 may become a 3 without triggering a date-format error. Compare the date with nearby transactions and the statement period, but do not “correct” it solely to restore a tidy sequence. Some statements group transaction types or show posting dates that differ from transaction dates.

Repeated visual errors suggest an input problem rather than a collection of unrelated typos. If every amount in the far-right column loses its last digit, inspect the scan’s right edge. If several dates on one page are shifted, inspect rotation or page curvature. Fixing the source and rerunning that page can be more reliable than repairing many interconnected rows manually.

## Decimal separators and currency symbols

Determine the statement’s numeric convention before cleaning OCR text. A comma can separate thousands or mark the decimal fraction. A period can serve either purpose in another locale. Keep the raw recognized text alongside the corrected number until the interpretation is established. Removing all punctuation is particularly dangerous when cents or other fractional currency units matter.

Currency symbols can become letters or vanish. The absence of a dollar sign does not establish the currency of a multi-account document. Record currency at the account or section level from the original statement. If a foreign purchase includes both an original-currency amount and a posted home-currency amount, do not add both as separate account movements.

Review debit and credit suffixes such as DR or CR where they appear. They may carry the direction of the balance rather than the direction of the transaction. Preserve that distinction in your working notes. A negative closing balance should not be converted to a positive number merely because the OCR recognized the digits clearly.

## Reviewing low-confidence and suspicious rows

Low confidence can be your own assessment even when the interface does not display a score. Flag rows with unusual dates, blank descriptions, repeated amounts, unexplained balance jumps, or characters in monetary columns. These are candidates for review, not proof of an error. A repeated payment can be legitimate, and a large transaction can be completely correct.

Compare the entire row rather than only the suspicious cell. An amount may have been assigned to the neighboring transaction, causing two rows to be wrong together. Look above and below the line, check the column heading, and inspect whether a wrapped description has been detached. Repair the relationship between fields, not just the appearance of one value.

Use a review-status column in the workbook: checked, corrected from source, or unresolved. Add the source page and a brief explanation for corrections. Keep the original recognized value when that helps another reviewer understand the change. These annotations are a manual review practice, not a claim that the product provides automated confidence scoring or an immutable audit history.

## Why balance validation matters

For a deposit account, compare the opening balance plus credits minus debits with the closing balance. Use the statement’s own sign convention and currency. If the statement provides running balances, compare changes in printed order to locate the first mismatch. OCR mistakes often become easier to identify when you know which pair of rows first breaks continuity.

Consider a fictional opening balance of 500.00 followed by a withdrawal of 18.75 and a deposit of 200.00. The expected ending balance is 681.25. If the withdrawal is recognized as 187.50, the difference is 168.75. That pattern points toward a decimal-placement issue, but the page image remains the evidence for the correction.

Do not rely solely on the net balance. Two missing transactions can offset each other, and repeated summary rows can distort both sides. Compare credits and debits separately, count transactions where the statement supplies counts, and inspect every page boundary. A monthly closing balance cannot establish whether a merchant description or date was recognized correctly.

## When manual correction is necessary

Manual correction is appropriate when the source is clear enough for a person to read and the extracted value is demonstrably wrong. Correct from the image, record the page, and rerun the affected totals. Avoid making changes based on what you expect a usual monthly payment to be. Fees, refunds, and payment changes can make a familiar transaction different this month.

If the source itself is unreadable, do not fill the field from inference. Request a fresh scan or bank download, or mark the line unresolved and exclude it from any claim of completed verification. If you must produce a partial extract, label the missing pages or rows clearly so a recipient does not mistake it for a complete statement.

Handwriting deserves separate caution. A handwritten annotation on a printed statement is not automatically a bank transaction. A note saying paid does not change the printed amount or establish the payment date. Keep annotations separate unless your workflow specifically requires their transcription and a reviewer can establish what they mean.

## Choose an output and finish the review

Excel is useful for scan review because you can keep recognized values, corrections, page references, and control formulas on separate sheets. CSV is useful for a later accepted import, but it cannot carry the workbook’s full review structure. Use [the CSV preparation guidance](/bank-statement-to-csv) when creating a narrower transaction file from a checked workbook.

Before sharing, reopen the downloaded export and test its numerical columns. OCR may have returned text that resembles a number, and a spreadsheet total might silently ignore it. Check the first and last transaction, then compare the total number of reviewed rows with the exported rows. Keep the original images accessible to the reviewer through an approved channel.

An OCR-derived spreadsheet is a working transcription. It does not replace an original statement for an official submission or establish that the scan is authentic. Ask the recipient which records it requires. If you need recurring processing, review [current usage options](/pricing) and test a difficult representative scan before planning a large run.

## Frequently asked questions

### Can OCR read a photographed statement?
It can attempt to recognize a clear photograph, but perspective, glare, shadows, and small text can affect the result. Capture the full page straight on, inspect the smallest amounts, and review the extracted rows against the photograph. A bank-issued digital PDF is preferable when you can obtain one.

### What scan quality works best?
Use a sharp, straight, evenly lit image with complete margins and readable punctuation. Around 300 dpi is a reasonable starting point for ordinary printed pages, not a guarantee. Review decimal points and minus signs after any contrast adjustment, cropping, or compression before submitting the file.

### Why did OCR confuse 0 and O?
Those characters can look similar in small print, low-resolution images, or compressed scans. Context may help recognition but cannot prove the value. Compare the source at a readable zoom and correct only the affected field, checking whether neighboring amounts or references show the same problem.

### Can OCR read handwritten statements?
Handwriting is more variable than printed statement text and should not be assumed to work reliably. Distinguish handwritten annotations from bank-printed activity. Where the source is unclear, request a clearer record or transcribe it through a controlled manual review rather than treating guessed output as verified data.

### How should I check OCR amounts?
Compare every amount and sign with the image, verify decimal placement, and test whether spreadsheet cells behave numerically. Sum credits and debits separately and reconcile the printed balances. Review unusual rows in context because an amount can be correct numerically but attached to the wrong transaction.

### Can a scanned PDF contain missing pages?
Yes. A scan can omit a page even when the file opens normally. Compare printed page numbering, statement dates, transaction continuity, and summary totals before conversion. Request missing pages where possible and label any partial output so another person understands the limits of its coverage.

### Is OCR suitable for official submissions?
OCR can help organize and review information, but its spreadsheet output is a transcription, not a bank-issued replacement. Follow the recipient’s document requirements and retain the original scan or PDF. Do not remove unresolved recognition issues from a working file without explaining the missing information.

### What should I do when OCR results are incomplete?
Identify whether the issue affects a page, section, or individual line. Improve the source image or obtain a digital download, then repeat the relevant extraction. Compare any new rows with the existing workbook to avoid duplicates, and leave unreadable entries unresolved until evidence supports a correction.
