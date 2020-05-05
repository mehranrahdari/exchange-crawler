package com.exchange.crawler.bootstrap;

import com.exchange.crawler.repository.ExchangeRecordRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
public class Bootstrap implements ApplicationListener<ContextRefreshedEvent> {

    @Value("${reset_data_on_start}")
    private String resetData;

    private ExchangeRecordRepository exchangeRecordRepository;

    public Bootstrap(ExchangeRecordRepository exchangeRecordRepository) {
        this.exchangeRecordRepository = exchangeRecordRepository;

    }


    @Override
    @Transactional
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (Boolean.valueOf(resetData)){
            log.info("###########");
            exchangeRecordRepository.deleteAll();
            //companyRepository.save(new Company("TextCompanyName1", "http://company.com"));

            log.info("Count {} ", exchangeRecordRepository.count());

            exchangeRecordRepository.findAll().forEach(c -> log.info("{}", c.toString()));
        }


    }
}
