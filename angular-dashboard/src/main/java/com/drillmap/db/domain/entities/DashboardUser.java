package com.drillmap.db.domain.entities;


import lombok.EqualsAndHashCode;
import lombok.ToString;

/**
 * Created by anthonyhayes on 8/7/14.
 */
@EqualsAndHashCode
@ToString
public class DashboardUser {

    private String channel;

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    private String user;

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }

    private String token;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }


}
