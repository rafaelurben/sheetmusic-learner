/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.config.auditing;

import static ch.rafaelurben.sheetmusiclearner.backend.utils.JwtUtils.extractUserId;
import static ch.rafaelurben.sheetmusiclearner.backend.utils.JwtUtils.getJwtPrincipal;

import ch.rafaelurben.sheetmusiclearner.backend.model.auditing.AuditRevisionEntry;
import java.util.UUID;
import org.hibernate.envers.RevisionListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Listener referenced in {@link AuditRevisionEntry} that adds the userId to all revisions. */
public class AuditRevisionListener implements RevisionListener {

  @Override
  public void newRevision(Object revisionEntity) {
    AuditRevisionEntry rev = (AuditRevisionEntry) revisionEntity;

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    UUID userId = extractUserId(getJwtPrincipal(authentication));
    rev.setUserId(userId);
  }
}
