const product = require("../models/product_schema")
const brand = require("../models/brand_schema")
const category = require("../models/category_schema")
const cart = require("../models/cart_schema")
const user = require("../models/user_schema")
const order = require("../models/order_schema")
const wallet = require("../models/wallet_schema")
const flash = require("express-flash")
const { generateSalesPDF } = require("../utility/downloadSalesReport")
const { generateLedgerPDF } = require("../utility/downloadLedgerBookReport")

module.exports = {

getSalesOrder: async (req, res) => {
    try {
        const latestOrders = await order.find().sort({ _id: -1 }).limit(6);
        // console.log(latestOrders);
        // const bestSeller = await order.aggregate([{ $unwind: "$items" },
        // { $group: { _id: "$items.productId", totalCount: { $sum: "$items.quantity" } } },
        // { $sort: { totalCount: -1 } }, { $limit: 6 },
        // { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productDetails" } },
        // { $unwind: "$productDetails" }])
        const bestSeller = await order.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.productId", totalCount: { $sum: "$items.quantity" } } },
            { $sort: { totalCount: -1 } },
            { $limit: 6 },
            { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productDetails" } },
            { $unwind: "$productDetails" },
            { $lookup: { from: "categories", localField: "productDetails.category", foreignField: "_id", as: "category" } },
            { $lookup: { from: "brands", localField: "productDetails.brand", foreignField: "_id", as: "brand" } }
        ]);


        console.log(bestSeller);

        if (!latestOrders || !bestSeller) throw new Error("No Data Found");

        res.json({ latestOrders, bestSeller });
    } catch (error) {
        console.log(
            "error while fetching the order details in the dashboard",
            error
        );
    }
},

getCount: async (req, res) => {
    try {
        const orders = await order.find({
            status: {
                $nin: ["Returned", "Cancelled", "Rejected"],
            },
        });

        const orderCountsByDay = {};
        const totalAmountByDay = {};
        const orderCountsByMonthYear = {};
        const totalAmountByMonthYear = {};
        const orderCountsByYear = {};
        const totalAmountByYear = {};
        let labelsByCount;
        let labelsByAmount;

        orders.forEach((order) => {
            const orderDate = new Date(order.orderDate);
            const dayMonthYear = orderDate.toISOString().split('T')[0];
            const monthYear = orderDate.toISOString().slice(0, 7);
            const year = orderDate.getFullYear().toString();

            if (req.url === "/countByday") {
                if (!orderCountsByDay[dayMonthYear]) {
                    orderCountsByDay[dayMonthYear] = 1;
                    totalAmountByDay[dayMonthYear] = order.totalAmount;
                } else {
                    orderCountsByDay[dayMonthYear]++;
                    totalAmountByDay[dayMonthYear] += order.totalAmount;
                }
                const ordersByDay = Object.keys(orderCountsByDay).map(
                    (dayMonthYear) => ({
                        _id: dayMonthYear,
                        count: orderCountsByDay[dayMonthYear],
                    })
                );

                const amountsByDay = Object.keys(totalAmountByDay).map(
                    (dayMonthYear) => ({
                        _id: dayMonthYear,
                        total: totalAmountByDay[dayMonthYear],
                    })
                );

                amountsByDay.sort((a, b) => (a._id < b._id ? -1 : 1));
                ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));

                labelsByCount = ordersByDay.map((entry) =>
                    new Date(entry._id).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })
                );

                labelsByAmount = amountsByDay.map((entry) =>
                    new Date(entry._id).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })
                );


                dataByCount = ordersByDay.map((entry) => entry.count);
                dataByAmount = amountsByDay.map((entry) => entry.total);

            } else if (req.url === "/countBymonth") {
                if (!orderCountsByMonthYear[monthYear]) {
                    orderCountsByMonthYear[monthYear] = 1;
                    totalAmountByMonthYear[monthYear] = order.totalAmount;
                } else {
                    orderCountsByMonthYear[monthYear]++;
                    totalAmountByMonthYear[monthYear] += order.totalAmount;
                }

                const ordersByMonth = Object.keys(orderCountsByMonthYear).map(
                    (monthYear) => ({
                        _id: monthYear,
                        count: orderCountsByMonthYear[monthYear],
                    })
                );
                const amountsByMonth = Object.keys(totalAmountByMonthYear).map(
                    (monthYear) => ({
                        _id: monthYear,
                        total: totalAmountByMonthYear[monthYear],
                    })
                );

                ordersByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
                amountsByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));

                // labelsByCount = ordersByMonth.map((entry) =>
                //     moment(entry._id, "YYYY-MM").format("MMM YYYY")
                // );
                // labelsByAmount = amountsByMonth.map((entry) =>
                //     moment(entry._id, "YYYY-MM").format("MMM YYYY")
                // );

                labelsByCount = ordersByMonth.map((entry) =>
                    new Date(entry._id).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                    })
                );

                labelsByAmount = amountsByMonth.map((entry) =>
                    new Date(entry._id).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                    })
                );



                dataByCount = ordersByMonth.map((entry) => entry.count);
                dataByAmount = amountsByMonth.map((entry) => entry.total);

            } else if (req.url === "/countByyear") {
                // Count orders by year
                if (!orderCountsByYear[year]) {
                    orderCountsByYear[year] = 1;
                    totalAmountByYear[year] = order.totalAmount;
                } else {
                    orderCountsByYear[year]++;
                    totalAmountByYear[year] += order.totalAmount;
                }

                const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
                    _id: year,
                    count: orderCountsByYear[year],
                }));
                const amountsByYear = Object.keys(totalAmountByYear).map((year) => ({
                    _id: year,
                    total: totalAmountByYear[year],
                }));

                ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
                amountsByYear.sort((a, b) => (a._id < b._id ? -1 : 1));

                labelsByCount = ordersByYear.map((entry) => entry._id.toString());
                labelsByAmount = amountsByYear.map((entry) => entry._id.toString());
                dataByCount = ordersByYear.map((entry) => entry.count);
                dataByAmount = amountsByYear.map((entry) => entry.total);
            }
        });

        res.json({ labelsByCount, labelsByAmount, dataByCount, dataByAmount });
    } catch (error) {
        console.error("error while chart loading :", error);
    }
},


getSalesReportDownload: async (req, res) => {

    try {
        let startDate = new Date(req.body.startDate);
        let endDate = new Date(req.body.endDate);
        endDate.setHours(23, 59, 59, 999);
        startDate .setHours(0,0,0,0)
        const Order = await order
            .find({
                paymentStatus: "Paid",
                orderDate: {
                    $gte: startDate,
                    $lte: endDate,
                },
            })
            .populate("items.productId");
    //   console.log(Order,"3333333333333");
        const pdfBuffer = await generateSalesPDF(Order, startDate, endDate);

        // Set headers for the response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=sales Report.pdf"
        );

        res.status(200).end(pdfBuffer);


    } catch (error) {
        console.error(error);
        
    }
},
getdownloadLedgerReport:async(req,res)=>{
    try {
        let startDate = new Date(req.body.startDate);
        let endDate = new Date(req.body.endDate);
        endDate.setHours(23, 59, 59, 999);
        startDate.setHours(0, 0, 0, 0);
    
        // Fetch relevant data from the database
        const orders = await order.find({
            orderDate: {
                $gte: startDate,
                $lte: endDate,
            },
            paymentStatus: "Paid"
        }).populate({
            path: "items.productId",
            populate: { path: "brand category" } // Assuming relationships are defined in your schema
        }).populate("userId");
    
        // Format data into ledger-like entries
        const ledgerEntries = [];
        let balance = 1000000;
    
        orders.forEach(order => {
            // Debit entry for each order
            ledgerEntries.push({
                date: order.orderDate,
                description: `Order ID: ${order._id}`,
                debit: order.totalAmount,
                credit: 0,
                balance: balance + order.totalAmount
            });
    
            // Credit entry for each product in the order
            order.items.forEach(item => {
                const product = item.productId;
                ledgerEntries.push({
                    date: order.orderDate,
                    description: `Sold ${item.quantity} ${product.brand.name} ${product.name}`,
                    debit: 0,
                    credit: item.quantity * product.price,
                    balance: balance
                });
                balance -= item.quantity * product.price;
            });
    
            // Additional logic for handling discounts, taxes, etc. can be added here
    
        });
    
        // Generate PDF using the ledger-like data
        const pdfBuffer = await generateLedgerPDF(ledgerEntries, startDate, endDate, balance);
    
        // Set headers for the response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=ledger_book.pdf"
        );
    
        res.status(200).end(pdfBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
    
    
},

}