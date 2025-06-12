package com.taskflow.server;
import java.util.TimeZone;
import javax.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import java.io.File; 



@SpringBootApplication
//@EnableCaching
public class ServerApplication {
	@PostConstruct
	public void init() {
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
	}

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing() // Won't fail if .env is not found
				.load();

		if (dotenv == null) {
			System.err.println("[DEBUG] Dotenv instance is null. .env file likely not loaded.");
		} else {
			if (dotenv.entries().isEmpty()) {
				System.err.println(
						"[DEBUG] Dotenv loaded, but no entries found. Is .env file empty or in the wrong location?");
			} else {
				System.out.println("[DEBUG] Dotenv loaded " + dotenv.entries().size() + " entries.");
			}

			for (DotenvEntry entry : dotenv.entries()) {
				System.out.println(
						"[DEBUG] Setting system property: '" + entry.getKey() + "' = '" + entry.getValue() + "'");
				System.setProperty(entry.getKey(), entry.getValue());
			}

			// Critical check: Verify if FRONTEND_URL is now a system property
			String frontendUrlSysProp = System.getProperty("FRONTEND_URL");
			if (frontendUrlSysProp != null) {
				System.out.println(
						"[DEBUG] SUCCESS: System.getProperty(\"FRONTEND_URL\") retrieved: " + frontendUrlSysProp);
			} else {
				System.err.println(
						"[DEBUG] CRITICAL FAILURE: System.getProperty(\"FRONTEND_URL\") is NULL after attempting to set it.");
				System.err.println("[DEBUG] Please check: ");
				System.err.println("1. If '.env' file exists in: " + new File("./.env").getAbsolutePath()
						+ " (or module root like " + new File("./server/.env").getAbsolutePath() + ")");
				System.err.println("2. If '.env' file contains 'FRONTEND_URL=your_value_here'");
				System.err.println("3. If there are any typos in the key 'FRONTEND_URL' in your .env file.");
			}
		}

		SpringApplication.run(ServerApplication.class, args);
	}
}