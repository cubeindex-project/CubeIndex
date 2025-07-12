export interface UserAchievements {
  /** Username — references profiles.username */
  username: string;

  /** Achievement name — references achievements.name */
  achievement: string;

  /** Who awarded it, defaults to 'CubeIndex' — references profiles.username */
  awarded_by: string;

  /** When it was awarded (ISO timestamp), defaults to now() */
  awarded_at: string;
}
