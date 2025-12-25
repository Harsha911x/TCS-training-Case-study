package com.example.ecart.service;

import com.example.ecart.domain.entity.Invoice;
import com.example.ecart.domain.entity.Order;
import com.example.ecart.domain.entity.OrderItem;
import com.example.ecart.repository.InvoiceRepository;
import com.example.ecart.repository.OrderItemRepository;
import com.example.ecart.repository.OrderRepository;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private OrderRepository orderRepository;

    // ---------- AMOUNT TO WORDS (Indian Format) ----------
    private static final String[] units = {
            "", "One", "Two", "Three", "Four", "Five", "Six",
            "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
            "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
            "Eighteen", "Nineteen"
    };

    private static final String[] tens = {
            "", "", "Twenty", "Thirty", "Forty", "Fifty",
            "Sixty", "Seventy", "Eighty", "Ninety"
    };

    public static String convertNumberToWords(long n) {
        if (n < 20)
            return units[(int) n];
        if (n < 100)
            return tens[(int) n / 10] + ((n % 10 != 0) ? " " + units[(int) n % 10] : "");
        if (n < 1000)
            return units[(int) n / 100] + " Hundred" + ((n % 100 != 0) ? " " + convertNumberToWords(n % 100) : "");
        if (n < 100000)
            return convertNumberToWords(n / 1000) + " Thousand" + ((n % 1000 != 0) ? " " + convertNumberToWords(n % 1000) : "");
        if (n < 10000000)
            return convertNumberToWords(n / 100000) + " Lakh" + ((n % 100000 != 0) ? " " + convertNumberToWords(n % 100000) : "");
        return convertNumberToWords(n / 10000000) + " Crore" + ((n % 10000000 != 0) ? " " + convertNumberToWords(n % 10000000) : "");
    }

    @Transactional
    public Invoice generateInvoice(Order order, String transactionId) {
        Optional<Invoice> existingInvoice = invoiceRepository.findByOrder(order);
        if (existingInvoice.isPresent()) {
            Invoice invoice = existingInvoice.get();
            if (!invoice.getTransactionId().equals(transactionId)) {
                invoice.setTransactionId(transactionId);
                invoiceRepository.save(invoice);
            }
            return invoice;
        }

        Invoice invoice = Invoice.builder()
                .order(order)
                .transactionId(transactionId)
                .totalAmount(order.getTotalAmount())
                .paymentMode(order.getPaymentMode())
                .build();

        return invoiceRepository.save(invoice);
    }

   //pdf

    public byte[] generateInvoicePdf(String orderId) {

        Invoice invoice = invoiceRepository.findByOrderId(
                orderRepository.findByOrderId(orderId)
                        .orElseThrow(() -> new RuntimeException("Order not found"))
                        .getId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        Order order = invoice.getOrder();
        List<OrderItem> items = orderItemRepository.findByOrder(order);

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            // buisness name
            Font bzFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26);
            bzFont.setColor(new Color(255,165,0)); 
            Paragraph bzname = new Paragraph("E-CART", bzFont);
            bzname.setAlignment(Element.ALIGN_CENTER);
            bzname.setSpacingAfter(15f);
            document.add(bzname);

            // invoice title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("INVOICE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(15f);
            document.add(title);

            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            // sold by & bill to
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setSpacingAfter(20f);

            PdfPCell soldBorder = new PdfPCell();
            soldBorder.setPadding(10f);

            soldBorder.addElement(new Paragraph("Sold By:", boldFont));
            soldBorder.addElement(new Paragraph("Ecart Private Limited", normalFont));
            soldBorder.addElement(new Paragraph("123 Ecart Street Mumbai", normalFont));
            soldBorder.addElement(new Paragraph("India 400111", normalFont));
            soldBorder.addElement(new Paragraph("9876543210", normalFont));


            PdfPCell billBorder = new PdfPCell();
            billBorder.setPadding(10f);

            billBorder.addElement(new Paragraph("Bill To:", boldFont));
            billBorder.addElement(new Paragraph("Name: " + order.getCustomer().getName(), normalFont));
            billBorder.addElement(new Paragraph("Phone: "+ order.getCustomer().getPhoneNumber(), normalFont));
            billBorder.addElement(new Paragraph("Address: " + order.getCustomer().getAddress1(), normalFont));
             billBorder.addElement(new Paragraph("Zip Code: " +order.getCustomer().getZipCode(), normalFont));

            headerTable.addCell(soldBorder);
            headerTable.addCell(billBorder);

            document.add(headerTable);

            //invoice
            document.add(new Paragraph("Invoice ID: " + invoice.getId(), normalFont));
            document.add(new Paragraph("Order ID: " + order.getOrderId(), normalFont));
            document.add(new Paragraph("Transaction ID: " + invoice.getTransactionId(), normalFont));
            document.add(new Paragraph("Date: " + invoice.getTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), normalFont));
            document.add(new Paragraph(" "));

            
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2, 4, 2, 2, 2});

            // Header Cells (Gray)
            addHeaderCell(table, "Product ID", boldFont);
            addHeaderCell(table, "Product Name", boldFont);
            addHeaderCell(table, "Qty", boldFont);
            addHeaderCell(table, "Unit Price", boldFont);
            addHeaderCell(table, "Total", boldFont);

            BigDecimal grossTotal = BigDecimal.ZERO;

            for (OrderItem item : items) {
                table.addCell(new PdfPCell(new Phrase(item.getProduct().getProductId(), normalFont)));
                table.addCell(new PdfPCell(new Phrase(item.getProductName(), normalFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), normalFont)));
                table.addCell(new PdfPCell(new Phrase("Rs. "+ item.getUnitPrice(), normalFont)));

                BigDecimal itemTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                grossTotal = grossTotal.add(itemTotal);

                table.addCell(new PdfPCell(new Phrase("Rs. " + itemTotal, normalFont)));
            }

            document.add(table);

           
            long rounded = grossTotal.longValue();
            String amountWords = convertNumberToWords(rounded) + " Rupees Only";

            PdfPCell wordsCell = new PdfPCell(new Phrase("Amount in Words: " + amountWords,
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12)));
            wordsCell.setPadding(10f);
            wordsCell.setBorderWidth(1);
            wordsCell.setBackgroundColor(new Color(245, 245, 245));

            PdfPTable wordsTable = new PdfPTable(1);
            wordsTable.setWidthPercentage(100);
            wordsTable.setSpacingBefore(15f);
            wordsTable.addCell(wordsCell);

            document.add(wordsTable);

           
            PdfPTable totalTable = new PdfPTable(1);
            totalTable.setWidthPercentage(40);
            totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

            PdfPCell totalCell = new PdfPCell(new Phrase("Total Amount: Rs. " + grossTotal, boldFont));
            totalCell.setPadding(10f);
            totalCell.setBackgroundColor(new Color(230, 230, 230));
            totalCell.setBorderWidth(1);

            totalTable.addCell(totalCell);
            totalTable.setSpacingBefore(10f);

            document.add(totalTable);

            // ------- Footer Line (Horizontal Divider) -------
          PdfPTable footerLine = new PdfPTable(1);
          footerLine.setWidthPercentage(100);

         PdfPCell lineCell = new PdfPCell();
         lineCell.setBorderWidthTop(1);
         lineCell.setBorderWidthBottom(0);
         lineCell.setBorderWidthLeft(0);
         lineCell.setBorderWidthRight(0);
         lineCell.setFixedHeight(5);
         footerLine.addCell(lineCell);

        footerLine.setSpacingBefore(15f);
        document.add(footerLine);

       // ------- Footer Text -------
        String generatedTime = java.time.LocalDateTime.now()
        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
        footerFont.setColor(new Color(120, 120, 120)); // Gray color

       //  timestamp(bottom-right)
       Paragraph footerRight = new Paragraph(
        "Invoice Generated On: " + generatedTime,
        footerFont
        );
      footerRight.setAlignment(Element.ALIGN_RIGHT);
      footerRight.setSpacingBefore(5f);
      document.add(footerRight);

      // "Computer generated" note
      Paragraph autoText = new Paragraph(
        "This is a computer generated invoice.",
        footerFont
       );
    autoText.setAlignment(Element.ALIGN_RIGHT);
    autoText.setSpacingBefore(2f);
    document.add(autoText);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating invoice PDF", e);
        }
    }

    
    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(Color.LIGHT_GRAY);
        cell.setPadding(6f);
        cell.setBorderWidth(1);
        table.addCell(cell);
    }
}