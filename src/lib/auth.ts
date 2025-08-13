import { cookies } from 'next/headers';

export interface UserSession {
  id: string;
  username: string;
  role: string;
  name: string;
  surname: string;
}

export async function getUserSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) {
      return null;
    }

    const sessionData = JSON.parse(sessionCookie.value) as UserSession;
    return sessionData;
  } catch (error) {
    console.error('Error parsing session:', error);
    return null;
  }
}

export function getSessionFromRequest(request: Request): UserSession | null {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;

    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(cookie => {
        const [name, value] = cookie.trim().split('=');
        return [name, value];
      })
    );

    const sessionCookie = cookies['session'];
    if (!sessionCookie) return null;

    const sessionData = JSON.parse(decodeURIComponent(sessionCookie)) as UserSession;
    return sessionData;
  } catch (error) {
    console.error('Error parsing session from request:', error);
    return null;
  }
}
