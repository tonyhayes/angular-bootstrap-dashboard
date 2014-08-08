package com.drillmap.db.domain.entities;

/**
 * Created by anthonyhayes on 8/7/14.
 */
public class DashboardMessage {

    private String channel;

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    private String token;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    private boolean initialize;

    public boolean isInitialize() {
        return initialize;
    }

    public void setInitialize(boolean initialize) {
        this.initialize = initialize;
    }



    private Object message;

    public Object getMessage() { return message; }
    public void setMessage(Object message) { this.message = message; }

}
