package com.exchange.crawler.service;

import com.exchange.crawler.model.ExchangeRecord;

import java.util.List;


public interface ExchangeRecordService {
    Iterable<ExchangeRecord> saveAll(Iterable<ExchangeRecord> companies);

    Iterable<ExchangeRecord> findAll();

    List<ExchangeRecord> findAllAsList();
}
