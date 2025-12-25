package com.example.ecart.security;

import com.example.ecart.domain.entity.AdminUser;
import com.example.ecart.domain.entity.Customer;
import com.example.ecart.repository.AdminUserRepository;
import com.example.ecart.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try customer first
        Customer customer = customerRepository.findByCustomerId(username).orElse(null);
        if (customer != null && customer.getStatus() == Customer.CustomerStatus.ACTIVE) {
            return new User(customer.getCustomerId(), customer.getPasswordHash(), new ArrayList<>());
        }

        // Try admin
        AdminUser admin = adminUserRepository.findByUsername(username).orElse(null);
        if (admin != null && admin.getActive()) {
            return new User(admin.getUsername(), admin.getPasswordHash(), new ArrayList<>());
        }

        throw new UsernameNotFoundException("User not found: " + username);
    }
}

