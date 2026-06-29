export type BankInfo = {
  name: string;
  fullName: string;
  type: string;
  headquarters: string;
  founded: string;
  customers: string;
  color: string;
  statementFormats: string[];
  popularFor: string[];
  downloadInstructions?: { title: string; steps: string[] }[];
};

export const indianBanks: Record<string, BankInfo> = {
  "hdfc-bank": {
    name: "HDFC Bank",
    fullName: "Housing Development Finance Corporation Bank",
    type: "Private Sector Bank",
    headquarters: "Mumbai, Maharashtra",
    founded: "1994",
    customers: "77 million+",
    color: "#004C8F",
    statementFormats: ["PDF Statement", "Mini Statement", "Account Statement", "Passbook Statement"],
    popularFor: ["NetBanking statements", "Mobile banking PDF", "Credit card statements"],
    downloadInstructions: [
      {
        title: "Method 1 — HDFC NetBanking",
        steps: ["Login to netbanking.hdfcbank.com", "Go to Accounts → Account Statement", "Select date range", "Click Download PDF"]
      },
      {
        title: "Method 2 — HDFC Mobile App",
        steps: ["Open HDFC Bank Mobile App", "Go to Accounts", "Tap Statement", "Select PDF format", "Download"]
      },
      {
        title: "Method 3 — HDFC Email Statement",
        steps: ["Register for email statement", "Statement arrives monthly", "Download PDF from email"]
      }
    ]
  },
  "sbi-bank": {
    name: "State Bank of India",
    fullName: "State Bank of India",
    type: "Public Sector Bank",
    headquarters: "Mumbai, Maharashtra",
    founded: "1955",
    customers: "500 million+",
    color: "#2D5FAA",
    statementFormats: ["YONO App Statement", "NetBanking Statement", "Branch Statement", "Passbook Statement"],
    popularFor: ["YONO app PDF download", "NetBanking statement", "Account statement for ITR"],
    downloadInstructions: [
      {
        title: "Method 1 — YONO App",
        steps: ["Login to YONO SBI App", "Navigate to Accounts", "Select the account", "Click on the passbook icon to download PDF"]
      },
      {
        title: "Method 2 — Onlinesbi",
        steps: ["Visit onlinesbi.com and login", "Go to 'My Accounts & Profile'", "Click on 'Account Statement'", "Select account, date range, and choose PDF format", "Click 'Go' to download"]
      }
    ]
  },
  "icici-bank": {
    name: "ICICI Bank",
    fullName: "Industrial Credit and Investment Corporation of India",
    type: "Private Sector Bank",
    headquarters: "Mumbai, Maharashtra",
    founded: "1994",
    customers: "50 million+",
    color: "#F58220",
    statementFormats: ["iMobile Statement", "NetBanking Statement", "Email Statement", "Account Statement"],
    popularFor: ["iMobile PDF statements", "Credit card statements", "Account statement for visa"],
    downloadInstructions: [
      {
        title: "Method 1 — iMobile Pay App",
        steps: ["Open iMobile Pay", "Tap on 'Accounts & Deposits'", "Select 'Detailed Statement'", "Choose date range and tap 'Proceed to PDF'"]
      },
      {
        title: "Method 2 — ICICI Internet Banking",
        steps: ["Login to ICICI NetBanking", "Go to 'Bank Accounts' -> 'Accounts'", "Click 'Detailed Statement'", "Select duration and click 'Get Statement' -> Download PDF"]
      }
    ]
  },
  "axis-bank": {
    name: "Axis Bank",
    fullName: "Axis Bank Limited",
    type: "Private Sector Bank",
    headquarters: "Mumbai, Maharashtra",
    founded: "1993",
    customers: "30 million+",
    color: "#800000",
    statementFormats: ["Mobile App Statement", "NetBanking Statement", "Email Statement"],
    popularFor: ["Mobile banking PDF", "Salary account statements", "Credit card PDF"],
    downloadInstructions: [
      {
        title: "Method 1 — Axis Mobile App",
        steps: ["Login to Axis Mobile", "Click on the specific Account", "Select 'View Statement'", "Choose 'Download Statement' and select PDF"]
      },
      {
        title: "Method 2 — Axis Internet Banking",
        steps: ["Login to Axis Bank Internet Banking", "Click on 'Accounts'", "Select 'Statement of Accounts'", "Choose dates and download as PDF"]
      }
    ]
  },
  "kotak-mahindra-bank": {
    name: "Kotak Mahindra Bank",
    fullName: "Kotak Mahindra Bank Limited",
    type: "Private Sector Bank",
    headquarters: "Mumbai, Maharashtra",
    founded: "2003",
    customers: "26 million+",
    color: "#EE3124",
    statementFormats: ["Kotak App Statement", "NetBanking Statement", "Email Statement"],
    popularFor: ["811 account statements", "Savings account PDF", "Credit card statements"],
    downloadInstructions: [
      {
        title: "Method 1 — Kotak Mobile Banking",
        steps: ["Open Kotak Mobile app", "Go to 'Banking' -> 'Account Activity'", "Select 'Statement' -> Email/Download PDF"]
      },
      {
        title: "Method 2 — NetBanking",
        steps: ["Login to Kotak NetBanking", "Navigate to 'Banking' -> 'Savings/Current Account'", "Click on 'Statement'", "Select period and click 'Download PDF'"]
      }
    ]
  },
  "yes-bank": {
    name: "Yes Bank",
    fullName: "Yes Bank Limited",
    type: "Private Sector Bank",
    headquarters: "Mumbai, Maharashtra",
    founded: "2004",
    customers: "3 million+",
    color: "#003087",
    statementFormats: ["YES Pay Statement", "NetBanking Statement", "Email Statement"],
    popularFor: ["Savings account statements", "Current account PDF", "Salary account statements"],
    downloadInstructions: [
      {
        title: "Method 1 — YES Mobile App",
        steps: ["Login to YES Mobile app", "Tap on 'Accounts'", "Select 'Detailed Statement'", "Choose dates and tap 'Download PDF'"]
      },
      {
        title: "Method 2 — YES ONLINE (NetBanking)",
        steps: ["Login to YES ONLINE", "Go to 'Accounts' -> 'Operative Accounts'", "Click 'Download Statement'", "Select PDF format and confirm"]
      }
    ]
  },
  "punjab-national-bank": {
    name: "Punjab National Bank",
    fullName: "Punjab National Bank",
    type: "Public Sector Bank",
    headquarters: "New Delhi",
    founded: "1894",
    customers: "180 million+",
    color: "#FF6600",
    statementFormats: ["PNB ONE App Statement", "NetBanking Statement", "Branch Statement"],
    popularFor: ["PNB ONE app PDF", "Passbook statement", "Account statement for loan"],
    downloadInstructions: [
      {
        title: "Method 1 — PNB ONE App",
        steps: ["Open PNB ONE", "Go to 'Services' -> 'Accounts'", "Select 'Statement'", "Choose Date range and click 'Download PDF'"]
      },
      {
        title: "Method 2 — PNB NetBanking",
        steps: ["Login to PNB IBS", "Go to 'Manage Accounts' -> 'Account Statement'", "Select the duration", "Click 'Download as PDF'"]
      }
    ]
  },
  "bank-of-baroda": {
    name: "Bank of Baroda",
    fullName: "Bank of Baroda",
    type: "Public Sector Bank",
    headquarters: "Vadodara, Gujarat",
    founded: "1908",
    customers: "150 million+",
    color: "#FF6600",
    statementFormats: ["BOB World App Statement", "NetBanking Statement", "Branch Statement"],
    popularFor: ["BOB World PDF", "Account statement for ITR", "Savings account statement"],
    downloadInstructions: [
      {
        title: "Method 1 — BOB World App",
        steps: ["Login to BOB World", "Click on 'My Accounts'", "Select 'Mini Statement' or 'Detailed Statement'", "Generate and tap Download PDF"]
      },
      {
        title: "Method 2 — BOB NetBanking",
        steps: ["Login to Baroda Connect", "Go to 'Accounts' -> 'Operative Accounts'", "Click on 'Account Statement'", "Select range and click 'Save as PDF'"]
      }
    ]
  },
  "canara-bank": {
    name: "Canara Bank",
    fullName: "Canara Bank",
    type: "Public Sector Bank",
    headquarters: "Bengaluru, Karnataka",
    founded: "1906",
    customers: "100 million+",
    color: "#FDB913",
    statementFormats: ["Candi App Statement", "NetBanking Statement", "Branch Statement"],
    popularFor: ["Candi app PDF download", "Account statement", "Statement for visa"],
    downloadInstructions: [
      {
        title: "Method 1 — Canara ai1 Mobile App",
        steps: ["Login to Canara ai1 app", "Go to 'Accounts'", "Select your account and click 'Statement'", "Choose dates and click 'Download PDF'"]
      },
      {
        title: "Method 2 — Canara NetBanking",
        steps: ["Login to Canara NetBanking", "Go to 'Accounts' -> 'Account Statement'", "Select specific dates", "Click the PDF icon to download"]
      }
    ]
  },
  "union-bank": {
    name: "Union Bank of India",
    fullName: "Union Bank of India",
    type: "Public Sector Bank",
    headquarters: "Mumbai, Maharashtra",
    founded: "1919",
    customers: "120 million+",
    color: "#003087",
    statementFormats: ["Union Mobile Statement", "NetBanking Statement", "Branch Statement"],
    popularFor: ["Union mobile PDF", "Account statement", "Statement for loan"],
    downloadInstructions: [
      {
        title: "Method 1 — Vyom App",
        steps: ["Open Vyom Union Bank App", "Navigate to Accounts -> Savings", "Click on 'Statement'", "Select the duration and Download PDF"]
      },
      {
        title: "Method 2 — NetBanking",
        steps: ["Login to Union Bank NetBanking", "Go to 'Accounts' -> 'Operative Accounts'", "Click 'Statement of Account'", "Select PDF format to save"]
      }
    ]
  },
  "bank-of-india": {
    name: "Bank of India",
    fullName: "Bank of India",
    type: "Public Sector Bank",
    headquarters: "Mumbai, Maharashtra",
    founded: "1906",
    customers: "60 million+",
    color: "#003087",
    statementFormats: ["BOI Mobile Statement", "NetBanking Statement", "Branch Statement"],
    popularFor: ["Mobile app PDF", "Account statement", "Statement for ITR"],
    downloadInstructions: [
      {
        title: "Method 1 — BOI Mobile",
        steps: ["Login to BOI Mobile app", "Tap 'Accounts'", "Select 'Detailed Statement'", "Input dates and tap download as PDF"]
      },
      {
        title: "Method 2 — BOI Internet Banking",
        steps: ["Login to StarToken/NetBanking", "Navigate to Accounts -> Account Statement", "Select Date range", "Click on Download (PDF)"]
      }
    ]
  },
  "indusind-bank": {
    name: "IndusInd Bank",
    fullName: "IndusInd Bank Limited",
    type: "Private Sector Bank",
    headquarters: "Mumbai, Maharashtra",
    founded: "1994",
    customers: "30 million+",
    color: "#E31837",
    statementFormats: ["IndusMobile Statement", "NetBanking Statement", "Email Statement"],
    popularFor: ["IndusMobile PDF", "Salary account statement", "Credit card statement"],
    downloadInstructions: [
      {
        title: "Method 1 — IndusMobile",
        steps: ["Open IndusMobile app", "Tap on 'Accounts'", "Select 'Statement'", "Specify the period and 'Download Statement'"]
      },
      {
        title: "Method 2 — IndusNet",
        steps: ["Login to IndusNet", "Go to 'Service Requests' -> 'Account Statement'", "Select the duration", "Click Download as PDF"]
      }
    ]
  },
  "idfc-first-bank": {
    name: "IDFC First Bank",
    fullName: "IDFC First Bank Limited",
    type: "Private Sector Bank",
    headquarters: "Mumbai, Maharashtra",
    founded: "2015",
    customers: "10 million+",
    color: "#FF6600",
    statementFormats: ["Mobile App Statement", "NetBanking Statement", "Email Statement"],
    popularFor: ["Zero fee account statements", "Savings account PDF", "Credit card statement"],
    downloadInstructions: [
      {
        title: "Method 1 — IDFC FIRST Mobile App",
        steps: ["Login to the mobile app", "Go to Accounts", "Tap on 'Account Statement'", "Choose timeline and tap 'Download'"]
      },
      {
        title: "Method 2 — NetBanking",
        steps: ["Login to IDFC First NetBanking", "Go to 'Accounts'", "Select 'Download Statement'", "Select date range and format as PDF"]
      }
    ]
  },
  "federal-bank": {
    name: "Federal Bank",
    fullName: "The Federal Bank Limited",
    type: "Private Sector Bank",
    headquarters: "Aluva, Kerala",
    founded: "1931",
    customers: "15 million+",
    color: "#003087",
    statementFormats: ["FedMobile Statement", "NetBanking Statement", "Email Statement"],
    popularFor: ["NRI account statements", "FedMobile PDF", "Account statement for visa"],
    downloadInstructions: [
      {
        title: "Method 1 — FedMobile",
        steps: ["Login to FedMobile", "Navigate to 'Accounts'", "Tap on 'Statement'", "Choose dates and select PDF to download"]
      },
      {
        title: "Method 2 — FedNet",
        steps: ["Login to FedNet Internet Banking", "Go to 'Accounts' -> 'Operative Accounts'", "Click 'Statement of Account'", "Select period and Download PDF"]
      }
    ]
  },
  "bandhan-bank": {
    name: "Bandhan Bank",
    fullName: "Bandhan Bank Limited",
    type: "Private Sector Bank",
    headquarters: "Kolkata, West Bengal",
    founded: "2015",
    customers: "25 million+",
    color: "#E31837",
    statementFormats: ["Bandhan Bank App Statement", "NetBanking Statement", "Branch Statement"],
    popularFor: ["Savings account statement", "Microfinance statements", "Account statement for loan"],
    downloadInstructions: [
      {
        title: "Method 1 — mBandhan App",
        steps: ["Login to mBandhan", "Tap on 'My Accounts'", "Select 'Account Statement'", "Pick the date range and tap Download as PDF"]
      },
      {
        title: "Method 2 — Internet Banking",
        steps: ["Login to Bandhan NetBanking", "Navigate to 'Accounts' -> 'Statement'", "Select duration", "Click Download PDF"]
      }
    ]
  },
  "rbl-bank": {
    name: "RBL Bank",
    fullName: "RBL Bank Limited",
    type: "Private Sector Bank",
    headquarters: "Mumbai, Maharashtra",
    founded: "1943",
    customers: "12 million+",
    color: "#E31837",
    statementFormats: ["RBL MoBank Statement", "NetBanking Statement", "Email Statement"],
    popularFor: ["Credit card PDF statement", "Savings account PDF", "Account statement"],
    downloadInstructions: [
      {
        title: "Method 1 — RBL MoBank App",
        steps: ["Open RBL MoBank app", "Go to 'Accounts' or 'Credit Cards'", "Select 'Statement'", "Choose period and Download PDF"]
      },
      {
        title: "Method 2 — NetBanking",
        steps: ["Login to RBL NetBanking", "Go to 'Accounts' -> 'Account Statement'", "Select the date range", "Click 'Download' and select PDF"]
      }
    ]
  },
  "south-indian-bank": {
    name: "South Indian Bank",
    fullName: "The South Indian Bank Limited",
    type: "Private Sector Bank",
    headquarters: "Thrissur, Kerala",
    founded: "1929",
    customers: "7 million+",
    color: "#00479E",
    statementFormats: ["SIB Mirror+ App Statement", "NetBanking Statement", "Email Statement"],
    popularFor: ["SIB Mirror+ PDF", "NRI account statement", "Savings account PDF"],
    downloadInstructions: [
      {
        title: "Method 1 — SIB Mirror+ App",
        steps: ["Open SIB Mirror+", "Tap 'My Accounts'", "Select 'Statement'", "Enter date range and Download PDF"]
      }
    ]
  },
  "central-bank": {
    name: "Central Bank of India",
    fullName: "Central Bank of India",
    type: "Public Sector Bank",
    headquarters: "Mumbai, Maharashtra",
    founded: "1911",
    customers: "40 million+",
    color: "#2C3E50",
    statementFormats: ["Cent Mobile Statement", "NetBanking Statement", "Branch Statement"],
    popularFor: ["Cent Mobile PDF", "Savings account statement", "Account statement for ITR"],
    downloadInstructions: [
      {
        title: "Method 1 — Cent Mobile App",
        steps: ["Login to Cent Mobile", "Go to Accounts", "Tap on 'Account Statement'", "Download PDF"]
      }
    ]
  },
  "indian-bank": {
    name: "Indian Bank",
    fullName: "Indian Bank",
    type: "Public Sector Bank",
    headquarters: "Chennai, Tamil Nadu",
    founded: "1907",
    customers: "100 million+",
    color: "#014885",
    statementFormats: ["IndOASIS App Statement", "NetBanking Statement", "Branch Statement"],
    popularFor: ["IndOASIS app PDF", "Account statement", "Savings statement for loan"],
    downloadInstructions: [
      {
        title: "Method 1 — IndOASIS App",
        steps: ["Login to IndOASIS", "Go to Accounts", "Tap 'Account Statement'", "Select date range and download PDF"]
      }
    ]
  },
  "karnataka-bank": {
    name: "Karnataka Bank",
    fullName: "Karnataka Bank Limited",
    type: "Private Sector Bank",
    headquarters: "Mangaluru, Karnataka",
    founded: "1924",
    customers: "11 million+",
    color: "#E22827",
    statementFormats: ["KBL Mobile Plus", "NetBanking Statement", "Email Statement"],
    popularFor: ["KBL Mobile PDF", "Account statement", "Statement for visa"],
    downloadInstructions: [
      {
        title: "Method 1 — KBL Mobile Plus",
        steps: ["Login to KBL Mobile Plus", "Go to 'My Accounts'", "Select 'Statement'", "Download as PDF"]
      }
    ]
  },
  "dcb-bank": {
    name: "DCB Bank",
    fullName: "DCB Bank Limited",
    type: "Private Sector Bank",
    headquarters: "Mumbai, Maharashtra",
    founded: "1930",
    customers: "2 million+",
    color: "#E2373B",
    statementFormats: ["DCB Mobile Statement", "NetBanking Statement", "Email Statement"],
    popularFor: ["DCB Mobile PDF", "Corporate account statement", "Savings account PDF"],
    downloadInstructions: [
      {
        title: "Method 1 — DCB Mobile",
        steps: ["Open DCB Mobile App", "Go to Accounts", "Tap on Statement", "Select PDF and download"]
      }
    ]
  },
  "au-small-finance-bank": {
    name: "AU Small Finance Bank",
    fullName: "AU Small Finance Bank Limited",
    type: "Small Finance Bank",
    headquarters: "Jaipur, Rajasthan",
    founded: "1996",
    customers: "4 million+",
    color: "#DF6E21",
    statementFormats: ["AU 0101 App Statement", "NetBanking Statement", "Email Statement"],
    popularFor: ["AU 0101 PDF", "Savings account PDF", "Credit card statement"],
    downloadInstructions: [
      {
        title: "Method 1 — AU 0101 App",
        steps: ["Login to AU 0101", "Go to Accounts", "Tap 'Statement'", "Select period and tap download PDF"]
      }
    ]
  },
  "ujjivan-small-finance-bank": {
    name: "Ujjivan Small Finance Bank",
    fullName: "Ujjivan Small Finance Bank Limited",
    type: "Small Finance Bank",
    headquarters: "Bengaluru, Karnataka",
    founded: "2005",
    customers: "7 million+",
    color: "#006497",
    statementFormats: ["Ujjivan Mobile App", "NetBanking Statement", "Email Statement"],
    popularFor: ["Ujjivan Mobile PDF", "Savings account statement", "Microfinance statement"],
    downloadInstructions: [
      {
        title: "Method 1 — Ujjivan Mobile App",
        steps: ["Open Ujjivan Mobile App", "Navigate to Accounts", "Select Account Statement", "Download PDF"]
      }
    ]
  },
  "equitas-small-finance-bank": {
    name: "Equitas Small Finance Bank",
    fullName: "Equitas Small Finance Bank Limited",
    type: "Small Finance Bank",
    headquarters: "Chennai, Tamil Nadu",
    founded: "2007",
    customers: "5 million+",
    color: "#EC1C24",
    statementFormats: ["Equitas Mobile App", "NetBanking Statement", "Email Statement"],
    popularFor: ["Equitas Mobile PDF", "Savings account PDF", "Account statement"],
    downloadInstructions: [
      {
        title: "Method 1 — Equitas Mobile App",
        steps: ["Login to Equitas App", "Go to Accounts", "Tap 'Statement'", "Download as PDF"]
      }
    ]
  },
  "paytm-payments-bank": {
    name: "Paytm Payments Bank",
    fullName: "Paytm Payments Bank Limited",
    type: "Payments Bank",
    headquarters: "Noida, Uttar Pradesh",
    founded: "2017",
    customers: "100 million+",
    color: "#00BAF2",
    statementFormats: ["Paytm App Statement", "Email Statement"],
    popularFor: ["Paytm App PDF", "Payments bank statement", "Account statement"],
    downloadInstructions: [
      {
        title: "Method 1 — Paytm App",
        steps: ["Open Paytm App", "Go to Paytm Bank", "Scroll to 'Downloads'", "Select 'Account Statement' and get it on email"]
      }
    ]
  },
  "airtel-payments-bank": {
    name: "Airtel Payments Bank",
    fullName: "Airtel Payments Bank Limited",
    type: "Payments Bank",
    headquarters: "New Delhi",
    founded: "2017",
    customers: "50 million+",
    color: "#E40000",
    statementFormats: ["Airtel Thanks App", "Email Statement"],
    popularFor: ["Airtel Thanks PDF", "Payments bank statement", "Account statement"],
    downloadInstructions: [
      {
        title: "Method 1 — Airtel Thanks App",
        steps: ["Open Airtel Thanks App", "Go to Banking", "Tap on 'Transaction History'", "Select 'Download Statement'"]
      }
    ]
  },
  "india-post-payments-bank": {
    name: "India Post Payments Bank",
    fullName: "India Post Payments Bank",
    type: "Payments Bank",
    headquarters: "New Delhi",
    founded: "2018",
    customers: "60 million+",
    color: "#004B87",
    statementFormats: ["IPPB Mobile App", "Email Statement"],
    popularFor: ["IPPB Mobile PDF", "Post office bank statement", "Account statement"],
    downloadInstructions: [
      {
        title: "Method 1 — IPPB Mobile App",
        steps: ["Open IPPB App", "Go to Accounts", "Tap 'Account Statement'", "Download as PDF"]
      }
    ]
  }
};
