package com.exchange.crawler.controller;

import com.exchange.crawler.form.FrmCrawler;
import com.exchange.crawler.model.ExchangeRecord;
import com.exchange.crawler.service.ExchangeRecordService;
import com.exchange.crawler.util.ExcelGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import lombok.extern.log4j.Log4j;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import javax.net.ssl.SSLException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

@Slf4j
@Controller
public class ExchangeRecordController {

    private final ExchangeRecordService exchangeRecordService;
    SslContext sslContext = SslContextBuilder
            .forClient()
            .trustManager(InsecureTrustManagerFactory.INSTANCE)
            .build();
    HttpClient httpClient = HttpClient.create().secure(sslSpec -> sslSpec.sslContext(sslContext));
    WebClient webClient = WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .build();
    private String FILTERTEXT;

    public ExchangeRecordController(ExchangeRecordService exchangeRecordService) throws SSLException {
        this.exchangeRecordService = exchangeRecordService;
    }

    @GetMapping
    public String index() {
        return "index";
    }

    /*@PostMapping()
    public @ResponseBody
    Company add(@RequestBody Company kayak) {
        return companyService.save(kayak);
    }*/

    @GetMapping("/all")
    public @ResponseBody
    Iterable<ExchangeRecord> getAll() {
        return exchangeRecordService.findAll();
    }

    @GetMapping(value = "/excel")
    public ResponseEntity<InputStreamResource> excelReport() throws IOException {
        List<ExchangeRecord> data = exchangeRecordService.findAllAsList();

        ByteArrayInputStream in = ExcelGenerator.toExcel(data);
        // return IOUtils.toByteArray(in);
        Date today = Date.from(Instant.now());
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=ExchangeDate-" + today.toString().replaceAll(" ", "_").replaceAll(":", "_") + ".xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(new InputStreamResource(in));
    }

    @PostMapping("/step1")
    public @ResponseBody
    Mono<String> crawlCompanies(@RequestBody FrmCrawler frmCrawler) {
        log.info(Mono.just(frmCrawler.getCount()).block().toString());
        log.info(Mono.just(frmCrawler.getFilter()).block());
        FILTERTEXT = frmCrawler.getFilter();

        int page = 1;
        int end = frmCrawler.getCount() / 20;

        for (int i = page; i <= end; i++) {
           if (!crawl_step1(i)){
               break;
           }
        }

        return Mono.empty();

    }

    private boolean crawl_step1(int page) {
        try {
            String url = "https://search.codal.ir/api/search/v2/q?&Audited=true&AuditorRef=-1&Category=1&Childs=true&CompanyState=-1&CompanyType=-1" +
                    "&Consolidatable=true&IsNotAudited=false&Length=-1&LetterType=-1&Mains=true&NotAudited=true&NotConsolidatable=true" +
                    "&PageNumber=" + page + "&Publisher=false&TracingNo=-1&search=true";

            String value = webClient
                    .get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .delaySubscription(Duration.ofSeconds(3))
                    .block();


            System.out.println(value);
            ObjectMapper objectMapper = new ObjectMapper();

            JsonNode jsonNode = objectMapper.readTree(value);

            JsonNode arr = jsonNode.findValues("Letters").get(0);
            List<ExchangeRecord> companies = new ArrayList<>();
            for (Iterator<JsonNode> it = arr.elements(); it.hasNext(); ) {
                JsonNode j = it.next();

                if (!j.get("Title").textValue().contains(FILTERTEXT)) {
                    continue;
                }
                System.out.println(j.get("TracingNo").asLong() + " " + j.get("CompanyName").textValue() + " " + j.get("Title").textValue());
                ExchangeRecord exchangeRecord = new ExchangeRecord(j.get("CompanyName").textValue()
                        , j.get("Symbol").textValue()
                        , j.get("Url").textValue()
                        , j.get("TracingNo").asLong()
                        , j.get("Title").textValue()
                        , j.get("PublishDateTime").textValue()
                );

                companies.add(exchangeRecord);

            }
            exchangeRecordService.saveAll(companies);
            return true;
        } catch (JsonProcessingException e) {
            System.out.println(e.getMessage());
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        return false;
    }



}