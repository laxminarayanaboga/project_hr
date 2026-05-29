package com.hrapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HrAppApplication {
    public static void main(String[] args) {
        SpringApplication.run(HrAppApplication.class, args);
    }
}
