package com.drillmap.db.domain.entities;

import com.drillmap.db.domain.TenantEntity;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.persistence.*;
import java.io.Serializable;

/**
 * Created by sfrensley on 4/29/14.
 */
@Entity
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class TenantAwareTestEntity extends TenantEntity implements Serializable{


}
