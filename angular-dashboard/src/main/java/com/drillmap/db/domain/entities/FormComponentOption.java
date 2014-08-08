package com.drillmap.db.domain.entities;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.persistence.*;

/**
 * Created by tony on 4/2/14.
 */
@Embeddable
@Data
@EqualsAndHashCode
@ToString
public class FormComponentOption {

    String option_id;
    String option_title;
    String option_value;

}
