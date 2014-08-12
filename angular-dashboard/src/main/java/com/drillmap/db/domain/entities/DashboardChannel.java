package com.drillmap.db.domain.entities;


import lombok.EqualsAndHashCode;
import lombok.ToString;

/**
 * Created by anthonyhayes on 8/7/14.
 */
@EqualsAndHashCode
@ToString
public class DashboardChannel {

    private String channel;

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }



}
