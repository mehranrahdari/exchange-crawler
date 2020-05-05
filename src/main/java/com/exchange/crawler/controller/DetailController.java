package com.exchange.crawler.controller;

import com.exchange.crawler.service.ExchangeRecordService;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import javax.net.ssl.*;
import java.text.Bidi;
import java.time.Duration;
import java.util.LinkedList;
import java.util.List;

@Slf4j
@Controller
public class DetailController {

    @Value("${websitename}")
    private String webSiteName;

    private final ExchangeRecordService exchangeRecordService;
    public DetailController(ExchangeRecordService exchangeRecordService) throws SSLException {
        this.exchangeRecordService = exchangeRecordService;
    }

    SslContext sslContext = SslContextBuilder
            .forClient()
            .trustManager(InsecureTrustManagerFactory.INSTANCE)
            .build();

    HttpClient httpClient = HttpClient.create()
            .secure(t -> t.sslContext(sslContext)
            .handlerConfigurator(
                    (handler) -> {
                        SSLEngine engine = handler.engine();
                        engine.setNeedClientAuth(true);

                        SSLParameters params = new SSLParameters();
                        List<SNIMatcher> matchers = new LinkedList<>();
                        SNIMatcher matcher = new SNIMatcher(0) {

                            @Override
                            public boolean matches(SNIServerName serverName) {
                                return true;
                            }
                        };
                        matchers.add(matcher);
                        params.setSNIMatchers(matchers);
                        engine.setSSLParameters(params);
                    }
            ));






    @PostMapping("/step2")
    public @ResponseBody
    Mono<String> getDetails() {
       // Iterable<ExchangeRecord> records = exchangeRecordService.findAll();
      /*  for (ExchangeRecord record: records) {
            crawl_step2(websitename+record.getLink());
        }*/
        crawl_step2(webSiteName);
        return Mono.empty();

    }

    private boolean crawl_step2(String url) {
        try {
            url="https://codal.ir/Reports/Decision.aspx?LetterSerial=cOgWgU4alvPYvMFZ8FtVSw%3D%3D&rt=0&let=6&ct=0&ft=-1";

            httpClient.followRedirect(false).disableRetry(true);
            httpClient.cookie("Cookie",cookie -> {
                cookie.setValue("BIGipServercodal.ir.app~codal.ir_pool=103092396.20480.0000; TS016c4ea9=0165c7a205feaf33a342f6ec56afca891cbf79a794220a1c7ab5252bfe9d177bdccab8aafdd8c4c46f2029e61630424b1b16d3f37c");
            });
            /*httpClient.headers(entries -> {
                header.add("Cache-Control","no-cache");
                entries.set(header);
            });*/
            WebClient webClient = WebClient.builder()
                    .clientConnector(new ReactorClientHttpConnector(httpClient))
                    .build();
            String value = webClient
                    .get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .delaySubscription(Duration.ofSeconds(3))
                    .block();


            System.out.println(value);
           /* ObjectMapper objectMapper = new ObjectMapper();

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
            exchangeRecordService.saveAll(companies);*/
            return true;
        /*} catch (JsonProcessingException e) {
            System.out.println(e.getMessage());*/
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        return false;
    }
}
