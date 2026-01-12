package com.ev.repository;

import com.ev.model.EvOwner;
import com.ev.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByOwner(EvOwner owner);
}
