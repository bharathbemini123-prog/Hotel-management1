package com.example.demo.util;

import com.example.demo.entity.Room;
import com.example.demo.repository.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SeedRooms {

    @Bean
    CommandLineRunner initDatabase(RoomRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                List<String> hotels = Arrays.asList(
                    "LuxeStay Chennai", "LuxeStay Bangalore", "LuxeStay Kochi",
                    "LuxeStay Hyderabad", "LuxeStay Munnar", "LuxeStay Ooty"
                );
                List<String> roomTypes = Arrays.asList("Deluxe", "Suite", "Single", "Double");

                for (String hotelName : hotels) {
                    System.out.println("Seeding 15 rooms for " + hotelName);
                    for (int i = 0; i < 15; i++) {
                        Room room = new Room();
                        room.setHotelName(hotelName);
                        room.setRoomType(roomTypes.get(i % roomTypes.size()));
                        room.setPrice(2500.0 + (int)(Math.random() * 15) * 500);
                        room.setAvailable(true);
                        repository.save(room);
                    }
                }
                System.out.println("Successfully seeded 90 rooms!");
            }
        };
    }
}
