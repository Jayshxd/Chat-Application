package com.jayesh.chatapplication.controller;

import com.jayesh.chatapplication.entities.Message;
import com.jayesh.chatapplication.repo.MessageRepo;
import com.jayesh.chatapplication.repo.RoomRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor

public class ChatController {

    private final RoomRepo roomRepo;
    private final MessageRepo messageRepo;


    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message handleMessage(
            @DestinationVariable String roomId,
            Message message
    ){
        if (!roomRepo.existsById(roomId)) {
            throw new IllegalArgumentException("Room does not exist");
        }

        if (message == null || message.getContent() == null || message.getContent().isBlank()) {
            throw new IllegalArgumentException("Message content is required");
        }

        message.setRoomId(roomId);
        message.setContent(message.getContent().trim());
        message.setSender(
                message.getSender() == null || message.getSender().isBlank()
                        ? "Anonymous"
                        : message.getSender().trim()
        );
        message.setTimestamp(LocalDateTime.now());
        return messageRepo.save(message);
    }

}
