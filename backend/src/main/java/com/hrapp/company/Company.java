package com.hrapp.company;

import com.hrapp.common.audit.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
public class Company extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false, length = 100)
    private String slug;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    private String address;

    private String country = "United Kingdom";

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "is_active")
    private boolean active = true;
}
