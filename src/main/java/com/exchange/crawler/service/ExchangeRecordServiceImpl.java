package com.exchange.crawler.service;

import com.exchange.crawler.model.ExchangeRecord;
import com.exchange.crawler.repository.ExchangeRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExchangeRecordServiceImpl implements ExchangeRecordService {

    public final ExchangeRecordRepository exchangeRecordRepository;

    public ExchangeRecordServiceImpl(ExchangeRecordRepository exchangeRecordRepository) {
        this.exchangeRecordRepository = exchangeRecordRepository;
    }

    @Override
    public Iterable<ExchangeRecord> saveAll(Iterable<ExchangeRecord> companies) {
        return exchangeRecordRepository.saveAll(companies);
    }

    @Override
    public Iterable<ExchangeRecord> findAll() {
        return exchangeRecordRepository.findAll();
    }

    @Override
    public List<ExchangeRecord> findAllAsList() {
        return exchangeRecordRepository.findAll();
    }
}
