package com.drillmap.db.web;

/**
 * Created by anthonyhayes on 8/6/14.
 */
import com.drillmap.db.domain.entities.DashboardMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;


@Controller
public class SocksController {

    List<DashboardMessage> lastChannelMessage = new ArrayList();


    @MessageMapping("/socket")
    @SendTo("/widget")
    public Object widgetMessage(DashboardMessage message) throws Exception {

        if(message.isInitialize()){
            DashboardMessage msg = getLastMessage(message);
            message.setMessage(msg.getMessage());
        }else{
            setLastMessage(message);
        }
        return message;
    }

     private Object setLastMessage(DashboardMessage message) throws Exception {

        boolean found = false;

        for (DashboardMessage lastMsg : lastChannelMessage) {
            if(lastMsg.getChannel().equals(message.getChannel())){
                found = true;
                lastMsg.setMessage(message.getMessage());
                break;
            }
        }
        if(!found){
            lastChannelMessage.add(message);
        }
        return message;
    }
    private DashboardMessage getLastMessage(DashboardMessage message) throws Exception {

        boolean found = false;

        for (DashboardMessage lastMsg : lastChannelMessage) {
            if(lastMsg.getChannel().equals(message.getChannel()) ){
                found = true;
                message = lastMsg;
                break;
            }
        }

        if(!found){
            setLastMessage(message);
        }
        return message;
    }


}



