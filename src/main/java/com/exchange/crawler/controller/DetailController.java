package com.exchange.crawler.controller;

import com.exchange.crawler.service.ExchangeRecordService;
import io.netty.handler.codec.http.HttpHeaders;
import io.netty.handler.codec.http.HttpMethod;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import javax.net.ssl.*;
import java.net.URI;
import java.text.Bidi;
import java.time.Duration;
import java.util.LinkedList;
import java.util.List;

@Slf4j
@Controller
public class DetailController {

    @Value("${websitename}")
    private String webSiteName;

    @Autowired
    private RestTemplate restTemplate;

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
            url = "https://codal.ir/Reports/Decision.aspx?LetterSerial=cOgWgU4alvPYvMFZ8FtVSw%3D%3D&rt=0&let=6&ct=0&ft=-1";

            httpClient.followRedirect(false).disableRetry(true);
            httpClient.cookie("Cookie", cookie -> {
                cookie.setValue("ASP.NET_SessionId=ghrnutmgjfhe4wjiga25qvel; usrInfo=uInfo=DrZ1PUv08tQQQaQQQIzrb6G8Ut4vdz6jBzuhiWCdIJPcc3o6RO3iCMQQQaQQQ17vVliRG7uUoQMbnWmWxcHy1QQQaQQQQcdASivdTHUtxkatOt9Uy6d74ybsAKPvJyE2qur3KFfadplGj3+xg6; BIGipServercodal.ir.app~codal.ir_pool=119869612.20480.0000; TS01516f8b=0165c7a205f792b274227d00c4e882c976d566c03d823fb53568693730ede1f733909b4c2001356125fc1743e918097a8ca3315553; ScreenWidth1=1920; ScreenHeight1=1080; TS016c4ea9=0165c7a205e2a79b01deafea37ca1becef84dc48cb09b0f8147a9a8918c87e7c30071efadc79e94b0428822f229db3d9b7bf468ccc");
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
 

            final String baseUrl = "https://codal.ir/Reports/Decision.aspx?LetterSerial=hHF6PKX9oKqE5aQQQaQQQYB1Totw%3D%3D&rt=0&let=6&ct=0&ft=-1";
            URI uri = new URI(baseUrl);

            ResponseEntity<String> result = restTemplate.getForEntity(uri, String.class);

            System.out.println(result.toString());
           /* ObjectMapper objectMapper = new ObjectMapper();

 //RestTemplate
 //HttpClient
 //Selenium

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
