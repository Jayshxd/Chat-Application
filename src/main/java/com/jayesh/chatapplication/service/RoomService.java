package com.jayesh.chatapplication.service;

import com.jayesh.chatapplication.entities.Message;
import com.jayesh.chatapplication.entities.Room;
import com.jayesh.chatapplication.repo.MessageRepo;
import com.jayesh.chatapplication.repo.RoomRepo;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.UUID;

@RequiredArgsConstructor
@Data
@Service
public class RoomService {
    private final RoomRepo roomRepo;
    private final MessageRepo messageRepo;


    // ! ROOM CREATION
    public Room createRoom(Room roomName) {
        Room room = new Room();
        room.setRoomName(roomName.getRoomName());
        String shortRoomId;

        // * USING THE TRY-RETRY METHOD
        // ? Why do-while?
        // ! We use do-while to ensure we generate an ID at least once.
        // ! It guarantees we have a string to test against the DB.
        // ! This loop prevents duplicate IDs.

        do{
            shortRoomId = UUID.randomUUID().toString().substring(0,6);
        }while(roomRepo.existsById(shortRoomId));

        room.setId(shortRoomId);
        return roomRepo.save(room);
    }

    // ! GET ROOM BY ID
    public Room getRoomById(String roomId) {
        return roomRepo.findById(roomId).orElse(null);
    }


    // ! GET MESSAGES OF A ROOM
    public Page<Message> getMessagesOfRoom(String roomId,int pageNo,int pageSize){
        int safePageNo = Math.max(pageNo, 0);
        int safePageSize = Math.min(Math.max(pageSize, 1), 100);
        Pageable pageable = PageRequest.of(safePageNo, safePageSize, Sort.by("timestamp").descending());
        return messageRepo.findByRoomId(roomId, pageable);
    }
}
