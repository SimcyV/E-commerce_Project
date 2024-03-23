const PDFDocument = require("pdfkit");
const moment = require("moment");

// Table Row with Bottom Line
function generateTableRow(doc, y, date, description, debit, credit, balance) {
  doc
    .fontSize(10)
    .text(date, 50, y)
    .text(description, 150, y)
    .text(debit, 300, y, { width: 90, align: "right" })
    .text(credit, 400, y, { width: 90, align: "right" })
    .text(balance, 500, y, { width: 90, align: "right" })
    .moveTo(50, y + 20)
    .lineTo(550, y + 20)
    .lineWidth(0.5)
    .strokeColor("#ccc")
    .stroke();
}

// Generate PDF using the ledger-like data
const generateLedgerPDF = async (ledgerEntries, startDate, endDate, openingBalance) => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
  
        const buffers = [];
        doc.on("data", (buffer) => buffers.push(buffer));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (error) => reject(error));
  
        // Header for the PDF
        doc
          .fontSize(15)
          .text(
            `Ledger Book from ${moment(startDate).format(
              "MMMM Do, YYYY"
            )} to ${moment(endDate).format("MMMM Do, YYYY")}`,
            { align: "center", width: 500 }
          );
  
        const ledgerTableTop = 100;
  
        // Table Header
        generateTableRow(
          doc,
          ledgerTableTop,
          "Date",
          "Description",
          "Debit",
          "Credit",
          "Balance"
        );
  
        let balance = openingBalance;
        ledgerEntries.forEach((entry, index) => {
          const position = ledgerTableTop + (index + 1) * 40;

        //   console.log("Debit:", entry.debit, typeof entry.debit);
        //   console.log("Credit:", entry.credit, typeof entry.credit);
          // Ensure debit and credit are numbers
          const debit = typeof entry.debit === 'number' ? entry.debit : 0;
          const credit = typeof entry.credit === 'number' ? entry.credit : 0;
  
          balance += debit - credit;
  
          generateTableRow(
            doc,
            position,
            moment(entry.date).format("YYYY-MM-DD"),
            entry.description,
            debit,
            credit,
            balance
          );
        });
  
        // End the document
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  };

module.exports = {
  generateLedgerPDF,
};
