package com.taskflow.server.Controllers;

import com.taskflow.server.Services.PDFGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/pdf")
public class PDFController {

    @Autowired
    private PDFGenerator pdfGenerator;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<byte[]> downloadProjectPdf(@PathVariable String projectId) throws IOException {
        // Generate the PDF file
        pdfGenerator.export(projectId);

        // Read the generated PDF file
        FileInputStream fis = new FileInputStream("project-statistics-"+projectId+".pdf");
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        byte[] buffer = new byte[1024];
        int bytesRead;

        while ((bytesRead = fis.read(buffer)) != -1) {
            baos.write(buffer, 0, bytesRead);
        }

        fis.close();

        // Set headers for browser download
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "project-statistics.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .body(baos.toByteArray());
    }
}
