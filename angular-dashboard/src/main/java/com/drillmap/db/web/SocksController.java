package com.drillmap.db.web;

/**
 * Created by anthonyhayes on 8/6/14.
 */
import com.drillmap.db.Application;
import com.drillmap.db.domain.entities.DashboardChannel;
import com.drillmap.db.domain.entities.DashboardMessage;
import com.drillmap.db.domain.entities.DashboardUser;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;

import java.io.PrintWriter;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;


@Controller
public class SocksController {

    List<DashboardMessage> lastChannelMessage = new ArrayList();
    List<DashboardUser> userNames = new ArrayList();
    List<DashboardChannel> channels = new ArrayList();

    /*
    Proof of concept socket application management function.
    -- needs disconnect logic
    -- needs a better user capture fn
    -- needs a more robust and easily expandable message/event processor
    -- needs error processing
        1. if a message is received without a channel, short circuit process and reject
    -- needs failback - the socket connection drops once in a while
     */

    @MessageMapping("/socket")
    @SendTo("/widget")
    public Object widgetMessage(DashboardMessage message, Principal principal) throws Exception {

        if(message.getAction().equals("initialize")) {

            // Get the logged in user's name
            // I'm having a problem with this -- I always get my name, not the newly logged in user
            String userName = principal.getName();

//            Object principal2 = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//            if (principal2 instanceof UserDetails) {
//                 userName = ((UserDetails)principal).getUsername();
//            } else {
//                 userName = principal.toString();
//            }
            PrintWriter pw = new PrintWriter(System.out, true);

            pw.println(" user ");
            pw.println(userName);


            setUserName(userName, message);
            setChannel(message);

            DashboardMessage msg = getLastMessage(message);
            message.setMessage(msg.getMessage());

        }else if(message.getAction().equals("getUsers")){

            message.setMessage(getUserNames(message));

        }else if(message.getAction().equals("getChannels")){

            message.setMessage(channels);

        }else{
            setLastMessage(message);
        }
        return message;
    }

    private void setUserName(String userName, DashboardMessage message) throws Exception {

        boolean found = false;

        for (DashboardUser user : userNames) {
            if(user.getUser().equals(userName) &&
                    user.getChannel().equals(message.getChannel()) &&
                    user.getToken().equals(message.getToken()) ){

                found = true;
                break;
            }
        }

        if(!found){
            DashboardUser user = new DashboardUser();
            user.setChannel(message.getChannel());
            user.setToken(message.getToken());
            user.setUser(userName);
            userNames.add(user);

        }
    }

    private List getUserNames(DashboardMessage message) throws Exception {

        List<DashboardUser> userList = new ArrayList();

        for (DashboardUser user : userNames) {

            if (user.getChannel().equals(message.getChannel())){
                userList.add(user);
            }
        }
        return userList;
    }

    private void setChannel( DashboardMessage message) throws Exception {

        boolean found = false;

        for (DashboardChannel channel : channels) {
            if(channel.getChannel().equals(message.getChannel())  ){

                found = true;
                break;
            }
        }

        if(!found){
            DashboardChannel channel = new DashboardChannel();
            channel.setChannel(message.getChannel());
            channels.add(channel);

        }
    }

    private void setLastMessage(DashboardMessage message) throws Exception {

        boolean found = false;
        String channel = message.getChannel();

        for (DashboardMessage lastMsg : lastChannelMessage) {
            String lastChannel = lastMsg.getChannel();
            if(lastChannel.equals(channel)){
                found = true;
                lastMsg.setMessage(message.getMessage());

                break;
            }
        }
        if(!found){
            lastChannelMessage.add(message);

        }
    }
    private DashboardMessage getLastMessage(DashboardMessage message) throws Exception {

        boolean found = false;
        String channel = message.getChannel();

        for (DashboardMessage lastMsg : lastChannelMessage) {
            String lastChannel = lastMsg.getChannel();

            if(lastChannel.equals(channel)){
                found = true;
                message.setMessage(lastMsg.getMessage());
                break;
            }
        }

        if(!found){
            setLastMessage(message);
        }
        return message;
    }


}



