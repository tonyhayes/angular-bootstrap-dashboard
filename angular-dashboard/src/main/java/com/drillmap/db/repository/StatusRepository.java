package com.drillmap.db.repository;

import com.drillmap.db.domain.entities.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Created by anthonyhayes on 6/26/14.
 */
public interface StatusRepository extends TenantAwareRepository<Status,Long>{

    @Query(value = "select e from #{#entityName} e where " +
            "lower(e.name) like :name and " +
            "e.tenantId = :tenantId")
    public Page<Status> findByName(
            @Param(value = "name") String name,
            @Param(value = "tenantId") Long tenantId, Pageable page);


}
