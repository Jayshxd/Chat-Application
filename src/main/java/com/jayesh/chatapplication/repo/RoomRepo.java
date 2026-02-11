package com.jayesh.chatapplication.repo;

import com.jayesh.chatapplication.entities.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepo extends MongoRepository<Room,String> {

}
