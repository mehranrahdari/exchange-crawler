package com.exchange.crawler.util;

import com.exchange.crawler.model.ExchangeRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.Date;
import java.util.List;

public class ExcelGenerator {

    public static ByteArrayInputStream toExcel(List<ExchangeRecord> records) throws IOException {
        String[] columns = {"Id","TracingNo", "CompanyName", "Symbol", "Title"};
        try (
                Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()
		) {
            CreationHelper createHelper = workbook.getCreationHelper();
            Date today = Date.from(Instant.now());
            Sheet sheet = workbook.createSheet("ExchangeData" + today.toString().replaceAll(" ", "_").replaceAll(":", "_"));

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.BLUE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            // Row for Header
            Row headerRow = sheet.createRow(0);

            // Header
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // CellStyle for Age
            CellStyle ageCellStyle = workbook.createCellStyle();
            ageCellStyle.setDataFormat(createHelper.createDataFormat().getFormat("#"));

            int rowIdx = 1;
            for (ExchangeRecord customer : records) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(customer.getId());
                row.createCell(1).setCellValue(customer.getTracing());
                row.createCell(2).setCellValue(customer.getName());
                row.createCell(3).setCellValue(customer.getSymbol());
                row.createCell(4).setCellValue(customer.getTitle());

			/*	Cell ageCell = row.createCell(3);
				ageCell.setCellValue(customer.getAge());
				ageCell.setCellStyle(ageCellStyle);*/
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}