package com.exchange.crawler.form;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;

@Getter
@Setter
@EqualsAndHashCode
@ToString
public class FrmCrawler implements Serializable {

    private static final long serialVersionUID = 752281L;


    private int count;

    private String filter;
}
