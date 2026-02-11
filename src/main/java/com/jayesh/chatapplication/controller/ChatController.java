package com.jayesh.chatapplication.controller;

import com.jayesh.chatapplication.entities.Message;
import com.jayesh.chatapplication.repo.MessageRepo;
import com.jayesh.chatapplication.repo.RoomRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

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
        message.setRoomId(roomId);
        message.setTimestamp(LocalDateTime.now());
        messageRepo.save(message);

        //* Return it so @SendTo can broadcast it to everyone else
        return message;
    }

}
