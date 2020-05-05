package com.exchange.crawler.repository;

import com.exchange.crawler.model.ExchangeRecord;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExchangeRecordRepository extends CrudRepository<ExchangeRecord, String> {

    List<ExchangeRecord> findAll();
}