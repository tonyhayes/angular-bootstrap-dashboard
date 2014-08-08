package com.drillmap.db.repository;

import com.drillmap.db.domain.entities.Opportunity;
import com.drillmap.db.domain.entities.OpportunityDetail;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Created by anthonyhayes on 4/2/14.
 */
public interface OpportunityDetailRepository extends TenantAwareRepository<OpportunityDetail, Long> {

    public List<OpportunityDetail> findByOpportunity(@Param(value = "opportunity") Opportunity opportunity);

}
