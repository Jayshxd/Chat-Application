package com.jayesh.chatapplication.entities;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "messages")
@CompoundIndex(def = "{'roomId': 1, 'timestamp': -1}")
public class Message {

    @Id
    private String id;
    private String roomId; // ! THIS IS YOUR "FOREIGN KEY
    private String sender;
    private String content;
    private LocalDateTime timestamp;

    public Message(String sender, String content, LocalDateTime timestamp,String roomId) {
        this.roomId = roomId;
        this.sender = sender;
        this.content = content;
        this.timestamp = LocalDateTime.now();
    }
}
