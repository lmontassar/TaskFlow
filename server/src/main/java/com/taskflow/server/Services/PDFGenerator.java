package com.taskflow.server.Services;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.taskflow.server.Entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.awt.*;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PDFGenerator {

    @Autowired
    private TacheService tacheService;

    @Autowired
    private ProjectService projectService;

    public void export(String projectId) {
        try {
            // Fetch project and tasks
            Project project = projectService.getProjectById(projectId);
            List<Tache> taches = tacheService.findTacheByProjectId(project);

            // Output PDF file
            OutputStream out = new FileOutputStream("project-statistics-" + project.getId() + ".pdf");
            Document document = new Document(PageSize.A4, 36, 36, 36, 36); // Add margins
            PdfWriter.getInstance(document, out);

            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.BLACK);
            Paragraph title = new Paragraph("Project Statistics Report", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" ")); // Empty line

            // Project Info
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.DARK_GRAY);

            document.add(new Paragraph(new Date().toString(), valueFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Project Name: ", labelFont));
            document.add(new Paragraph(project.getNom(), valueFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Description: ", labelFont));
            document.add(new Paragraph(project.getDescription() != null ? project.getDescription() : "No description", valueFont));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Owner: ", labelFont));
            document.add(new Paragraph(project.getCreateur().getEmail(), valueFont));
            document.add(new Paragraph(" "));

            // Tasks Table
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            table.setWidths(new float[]{3, 3, 1, 3}); // Proportional column widths

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);
            PdfPCell header;

            header = new PdfPCell(new Phrase("Task Name", headerFont));
            header.setBackgroundColor(Color.GRAY);
            table.addCell(header);

            header = new PdfPCell(new Phrase("Assigned To", headerFont));
            header.setBackgroundColor(Color.GRAY);
            table.addCell(header);

            header = new PdfPCell(new Phrase("Status", headerFont));
            header.setBackgroundColor(Color.GRAY);
            table.addCell(header);

            header = new PdfPCell(new Phrase("Estimated end date", headerFont));
            header.setBackgroundColor(Color.GRAY);
            table.addCell(header);

            // Table Data
            for (Tache tache : taches) {
                table.addCell(new Phrase(tache.getNomTache(), valueFont));

                String assignedTo;
                List<User> assignees = tache.getAssignee();
                if (assignees == null || assignees.isEmpty()) {
                    assignedTo = "None";
                } else {
                    assignedTo = assignees.stream()
                            .map(user -> user.getNom()+' '+user.getPrenom())
                            .collect(Collectors.joining(", "));
                }
                table.addCell(new Phrase(assignedTo, valueFont));

                String status = switch (tache.getStatut()) {
                    case TODO -> "To Do";
                    case REVIEW -> "Review";
                    case PROGRESS -> "In Progress";
                    case DONE -> "Done";
                    default -> tache.getStatut().toString();
                };
                table.addCell(new Phrase(status, valueFont));
                table.addCell(new Phrase(tache.getDateFinEstime().toString(), valueFont));
            }

            document.add(table);

            // Resource Table
            document.add(new Paragraph(" ")); // Empty line
            document.add(new Paragraph("Resources Summary", labelFont));

            PdfPTable resourceTable = new PdfPTable(5);
            resourceTable.setWidthPercentage(100);
            resourceTable.setSpacingBefore(10);
            resourceTable.setWidths(new float[]{3, 2, 2, 2, 2});

            header = new PdfPCell(new Phrase("Resource Name", headerFont));
            header.setBackgroundColor(Color.GRAY);
            resourceTable.addCell(header);

            header = new PdfPCell(new Phrase("Type", headerFont));
            header.setBackgroundColor(Color.GRAY);
            resourceTable.addCell(header);

            header = new PdfPCell(new Phrase("Unit Cost", headerFont));
            header.setBackgroundColor(Color.GRAY);
            resourceTable.addCell(header);

            header = new PdfPCell(new Phrase("Total Cost", headerFont));
            header.setBackgroundColor(Color.GRAY);
            resourceTable.addCell(header);

            header = new PdfPCell(new Phrase("Status", headerFont));
            header.setBackgroundColor(Color.GRAY);
            resourceTable.addCell(header);

            float totalResourceCost = 0;

            for (Resource resource : project.getListeRessource()) {
                resourceTable.addCell(new Phrase(resource.getNom(), valueFont));
                resourceTable.addCell(new Phrase(resource.getType(), valueFont));
                resourceTable.addCell(new Phrase("$ " + resource.getCoutUnitaire(), valueFont));

                float totalCost = 0;
                if (resource instanceof MaterialResource mr) {
                    totalCost = resource.getCoutUnitaire() * mr.getQte();
                } else if (resource instanceof EnergeticResource er) {
                    totalCost = resource.getCoutUnitaire() * er.getConsommationMax();
                } else if (resource instanceof TemporaryResource tr) {
                    totalCost = resource.getCoutUnitaire() * tr.getQte();
                }

                totalResourceCost += totalCost;
                resourceTable.addCell(new Phrase("$ " + totalCost, valueFont));
                resourceTable.addCell(new Phrase(resource.getStatus().toString(), valueFont));
            }

            document.add(resourceTable);

            // Total cost
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Total Resource Cost: $ " + totalResourceCost, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK)));

            // Footer
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Generated by TaskFlow", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY)));

            document.close();
            out.close();

            System.out.println("PDF exported successfully!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
