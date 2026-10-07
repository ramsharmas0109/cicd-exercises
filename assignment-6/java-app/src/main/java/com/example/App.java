package com.example;

import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class App {

    public static String message() {
        return "Hello from Java!";
    }

    public static void main(String[] args) throws IOException {

        HttpServer server = HttpServer.create(
                new InetSocketAddress(8080),
                0
        );

        server.createContext("/", exchange -> {

            String response = message();

            exchange.sendResponseHeaders(
                    200,
                    response.getBytes().length
            );

            try (OutputStream output = exchange.getResponseBody()) {
                output.write(response.getBytes());
            }
        });

        server.start();

        System.out.println("Server running on port 8080");
    }
}
