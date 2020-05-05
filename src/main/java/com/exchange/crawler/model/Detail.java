package com.exchange.crawler.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
@Data
@ToString
@EqualsAndHashCode
public class Detail {

    private String Isic;
    private String Period;

    public Detail(String isic, String period) {
        Isic = isic;
        Period = period;
    }
}
