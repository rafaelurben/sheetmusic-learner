/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.repository;

import ch.rafaelurben.sheetmusiclearner.backend.model.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomUserRepository extends JpaRepository<RoomUser, RoomUser.RoomUserId> {}
