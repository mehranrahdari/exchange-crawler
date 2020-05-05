package com.exchange.crawler.model;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.Data;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
@Data
@ToString(of = {"tracing", "name", "symbol"})
public class ExchangeRecord {

    @Id
    private String id;
    private String name;
    private String symbol;
    private String link;
    private Long tracing;
    private String title;
    private String publishDateTime;

    private Detail detail;

    public ExchangeRecord(String name, String symbol, String link, Long tracing, String title, String publishDateTime) {
        this.name = name;
        this.symbol = symbol;
        this.link = link;
        this.tracing = tracing;
        this.title = title;
        this.publishDateTime = publishDateTime;
    }

    public ExchangeRecord(Long tracing, Detail detail) {
        this.tracing = tracing;
        this.detail = detail;
    }

    public ExchangeRecord() {
    }

    @Override
    public String toString() {
        ObjectMapper mapper = new ObjectMapper();

        String jsonString = "";
        try {
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            jsonString = mapper.writeValueAsString(this);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        return jsonString;
    }
}
