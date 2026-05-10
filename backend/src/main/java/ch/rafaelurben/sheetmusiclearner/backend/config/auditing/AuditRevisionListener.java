/* (C) 2026 - Rafael Urben */
package ch.rafaelurben.sheetmusiclearner.backend.config.auditing;

import static ch.rafaelurben.sheetmusiclearner.backend.utils.JwtUtils.extractUserId;
import static ch.rafaelurben.sheetmusiclearner.backend.utils.JwtUtils.getJwtPrincipal;

import ch.rafaelurben.sheetmusiclearner.backend.api.dto.RevisionKind;
import ch.rafaelurben.sheetmusiclearner.backend.model.auditing.AuditRevisionEntry;
import java.util.UUID;
import org.hibernate.envers.RevisionListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Listener referenced in {@link AuditRevisionEntry} that is needed to set the revision's custom
 * fields: <br>
 * - {@link AuditRevisionEntry.Fields#userId}<br>
 * - {@link AuditRevisionEntry.Fields#revisionKind}
 */
public class AuditRevisionListener implements RevisionListener {

  private static final ThreadLocal<RevisionKind> REVISION_KIND = new ThreadLocal<>();

  public static void setRevisionKind(RevisionKind revisionKind) {
    REVISION_KIND.set(revisionKind);
  }

  public static void clearRevisionKind() {
    REVISION_KIND.remove();
  }

  @Override
  public void newRevision(Object revisionEntity) {
    AuditRevisionEntry rev = (AuditRevisionEntry) revisionEntity;

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    UUID userId = extractUserId(getJwtPrincipal(authentication));
    rev.setUserId(userId);
    rev.setRevisionKind(REVISION_KIND.get() != null ? REVISION_KIND.get() : RevisionKind.DEFAULT);
  }
}
