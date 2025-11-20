import { cookies } from 'next/headers';

export interface CollaboratorPermissions {
  overview: boolean;
  members: boolean;
  stay: boolean;
  crew: boolean;
  itinerary: boolean;
  travel: boolean;
  meals: boolean;
  event_profile: boolean;
}

export interface AuthResult {
  isAuthenticated: boolean;
  isExecutive: boolean;
  isCollaborator: boolean;
  collaboratorEventId?: string;
  permissions?: CollaboratorPermissions;
  userId?: string;
}

/**
 * Check authentication and return user type and permissions
 */
export async function checkAuth(): Promise<AuthResult> {
  const cookieStore = await cookies();
  const executiveSession = cookieStore.get('executive-session')?.value;
  const collaboratorSession = cookieStore.get('collaborator-session')?.value;

  if (executiveSession) {
    try {
      const user = JSON.parse(executiveSession);
      return {
        isAuthenticated: true,
        isExecutive: true,
        isCollaborator: false,
        userId: user.id,
      };
    } catch {
      // Invalid session
    }
  }

  if (collaboratorSession) {
    try {
      const session = JSON.parse(collaboratorSession);
      const permissions = typeof session.permissions === 'string'
        ? JSON.parse(session.permissions)
        : session.permissions;
      
      return {
        isAuthenticated: true,
        isExecutive: false,
        isCollaborator: true,
        collaboratorEventId: session.eventId,
        permissions: permissions as CollaboratorPermissions,
        userId: session.id,
      };
    } catch {
      // Invalid session
    }
  }

  return {
    isAuthenticated: false,
    isExecutive: false,
    isCollaborator: false,
  };
}

/**
 * Check if user has permission for a specific action
 */
export async function checkPermission(
  requiredPermission: keyof CollaboratorPermissions,
  eventId?: string
): Promise<{ allowed: boolean; auth: AuthResult }> {
  const auth = await checkAuth();

  if (!auth.isAuthenticated) {
    return { allowed: false, auth };
  }

  // Executives have all permissions
  if (auth.isExecutive) {
    return { allowed: true, auth };
  }

  // Collaborators need specific permission
  if (auth.isCollaborator) {
    // Check if event matches
    if (eventId && auth.collaboratorEventId !== eventId) {
      return { allowed: false, auth };
    }

    // Check permission
    if (auth.permissions && auth.permissions[requiredPermission]) {
      return { allowed: true, auth };
    }
  }

  return { allowed: false, auth };
}

