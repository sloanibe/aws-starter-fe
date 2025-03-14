package com.example.awsstarterapi;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;
import java.io.InputStream;
import java.security.KeyStore;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.CountDownLatch;

public class MongoConnectionTest {
    public static void main(String[] args) {
        String uri = "mongodb+srv://sloanibe:Elvisismydog1!@aws-starter.j7v6t.mongodb.net/aws_starter?retryWrites=true&w=majority";
        MongoClient mongoClient = null;
        CountDownLatch latch = new CountDownLatch(1);
        
        try {
            System.out.println("Attempting to connect to MongoDB Atlas...");
            
            // Load the CA certificate from classpath
            System.out.println("Loading CA certificate...");
            CertificateFactory cf = CertificateFactory.getInstance("X.509");
            try (InputStream certStream = MongoConnectionTest.class.getResourceAsStream("/certs/mongodb.crt")) {
                if (certStream == null) {
                    throw new RuntimeException("Could not find certificate file in classpath: /certs/mongodb.crt");
                }
                X509Certificate caCert = (X509Certificate) cf.generateCertificate(certStream);
                System.out.println("Successfully loaded CA certificate");

                // Create a KeyStore containing our trusted CAs
                KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
                keyStore.load(null, null);
                keyStore.setCertificateEntry("mongodb-ca", caCert);
                System.out.println("Added certificate to KeyStore");

                // Create a TrustManager that trusts the CAs in our KeyStore
                TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
                tmf.init(keyStore);
                System.out.println("Initialized TrustManagerFactory");

                // Create an SSLContext that uses our TrustManager
                SSLContext sslContext = SSLContext.getInstance("TLS");
                sslContext.init(null, tmf.getTrustManagers(), null);
                System.out.println("Successfully created SSL context");
                
                ConnectionString connectionString = new ConnectionString(uri);
                System.out.println("Created connection string");
                
                MongoClientSettings settings = MongoClientSettings.builder()
                    .applyConnectionString(connectionString)
                    .applyToSslSettings(builder -> {
                        builder.enabled(true)
                               .context(sslContext);
                        System.out.println("Configured SSL settings with custom certificate");
                    })
                    .applyToSocketSettings(builder -> {
                        builder.connectTimeout(30000, TimeUnit.MILLISECONDS)
                               .readTimeout(45000, TimeUnit.MILLISECONDS);
                        System.out.println("Configured socket timeouts: connect=30s, read=45s");
                    })
                    .applyToClusterSettings(builder -> {
                        builder.serverSelectionTimeout(15000, TimeUnit.MILLISECONDS);
                        System.out.println("Configured cluster settings: serverSelection=15s");
                    })
                    .build();
                
                System.out.println("Created MongoDB client settings");
                
                mongoClient = MongoClients.create(settings);
                System.out.println("Successfully created MongoClient");
                
                MongoDatabase database = mongoClient.getDatabase("aws_starter");
                System.out.println("Successfully got database reference");
                
                // List all collections
                System.out.println("Listing collections:");
                database.listCollectionNames().forEach(name -> 
                    System.out.println("Found collection: " + name));
                
                System.out.println("Connection test completed successfully!");
            }
        } catch (Exception e) {
            System.err.println("Failed to connect to MongoDB Atlas");
            e.printStackTrace();
        } finally {
            if (mongoClient != null) {
                try {
                    System.out.println("Closing MongoDB client...");
                    mongoClient.close();
                    // Give the client a moment to clean up its threads
                    Thread.sleep(1000);
                } catch (Exception e) {
                    System.err.println("Error while closing MongoDB client");
                    e.printStackTrace();
                }
            }
            // Signal that we're done
            latch.countDown();
        }
        
        try {
            // Wait for cleanup to complete
            latch.await(5, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("Interrupted while waiting for cleanup");
        }
        
        // Force exit to clean up any lingering non-daemon threads
        System.exit(0);
    }
}
