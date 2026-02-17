package com.jayesh.chatapplication.controller;

import com.jayesh.chatapplication.service.RoomService;
import com.jayesh.chatapplication.entities.Message;
import com.jayesh.chatapplication.entities.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final RoomService roomService;

    //TODO create Room
    /*
     To create a room ...from frontend the user will have a button to create a room
     User have to click on create a room,
    and we will automatically make a room.
     */
    @PostMapping
    public ResponseEntity<Room> post(@RequestBody Room roomName) {
        Room response = roomService.createRoom(roomName);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    //TODO Get a Room by RoomId
    @GetMapping("/{roomId}")
    public ResponseEntity<Room> getRoom(@PathVariable String roomId) {
        Room response = roomService.getRoomById(roomId);
        if(response == null) {
            return ResponseEntity.badRequest().body(null);
        }
        return ResponseEntity.ok().body(response);
    }


    //TODO get messages of a room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<Page<Message>> getMessagesOfRoom(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "50") int pageSize,
            @RequestParam(defaultValue = "0")int pageNo) {
        Page<Message> response = roomService.getMessagesOfRoom(roomId,pageNo,pageSize);
        if(response == null) {
            return ResponseEntity.badRequest()
                    .body(null);
        }
        return ResponseEntity.ok(response);
    }



}
