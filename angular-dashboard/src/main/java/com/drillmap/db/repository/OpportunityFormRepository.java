package com.drillmap.db.repository;

import com.drillmap.db.domain.entities.Opportunity;
import com.drillmap.db.domain.entities.OpportunityForm;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Created by anthonyhayes on 4/2/14.
 */
public interface OpportunityFormRepository extends TenantAwareRepository<OpportunityForm, Long> {


    @Query("select o from #{#entityName} o where " +
            "o.opportunity = :opportunity and " +
            "o.tenantId = :tenantId")
    public List<OpportunityForm> findByOpportunity(@Param(value = "opportunity") Opportunity opportunity, @Param(value = "tenantId") Long tenantId);

}
