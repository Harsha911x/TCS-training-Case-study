package com.example.ecart.util;

import com.example.ecart.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class CustomerIdGenerator {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final Pattern CUSTOMER_ID_PATTERN = Pattern.compile("CUST-(\\d{8})-(\\d{4})");
    
    @Autowired
    private CustomerRepository customerRepository;
    
    private int sequence = 0;
    private String lastDate = "";

    public synchronized String generateCustomerId() {
        String currentDate = LocalDate.now().format(DATE_FORMATTER);
        
        if (!currentDate.equals(lastDate)) {
            lastDate = currentDate;
            sequence = findMaxSequenceForDate(currentDate);
        }
        
        String customerId;
        int maxRetries = 1000; // Prevent infinite loop
        int retryCount = 0;
        
        do {
            sequence++;
            customerId = String.format("CUST-%s-%04d", currentDate, sequence);
            retryCount++;
            
            if (retryCount > maxRetries) {
                throw new RuntimeException("Unable to generate unique customer ID after " + maxRetries + " attempts");
            }
        } while (customerRepository.existsByCustomerId(customerId));
        
        return customerId;
    }
    
    private int findMaxSequenceForDate(String date) {
        // Find the maximum sequence number for the given date
        String datePrefix = "CUST-" + date + "-";
        
        return customerRepository.findAll().stream()
                .map(customer -> {
                    String custId = customer.getCustomerId();
                    if (custId != null && custId.startsWith(datePrefix)) {
                        Matcher matcher = CUSTOMER_ID_PATTERN.matcher(custId);
                        if (matcher.matches()) {
                            try {
                                return Integer.parseInt(matcher.group(2));
                            } catch (NumberFormatException e) {
                                return 0;
                            }
                        }
                    }
                    return 0;
                })
                .max(Integer::compareTo)
                .orElse(0);
    }
}

