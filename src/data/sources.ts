/**
 * Registry of citation sources for the `<Sources>` block.
 *
 * Each entry is a base URL plus the version the lessons were checked against. A
 * `<Sources>` item names one of these by id and adds a `path` (joined to `base`), so a
 * moved documentation root or a new library version is updated here, once.
 *
 * Cobra2026 and Riptide2025 are frozen repositories, so `main` is a stable reference.
 */
export interface SourceDefinition {
  /** Display name, as it appears in the sources list. */
  name: string;
  /** Base URL; `path` on an item is appended to it. */
  base: string;
  /** Version or date the lessons were checked against; shown after the name. */
  version?: string;
}

export const sourceRegistry = {
  mantik: {
    name: 'itkan-robotics/mantik',
    base: 'https://github.com/itkan-robotics/mantik/blob/main/',
    version: 'upstream',
  },
  'mantik-orange': {
    name: 'FRC3476/mantik-orange',
    base: 'https://github.com/FRC3476/mantik-orange/blob/main/',
    version: 'upstream',
  },
  cobra: {
    name: 'FRC 4451 Cobra2026',
    base: 'https://github.com/frc4451/Cobra2026Private/blob/main/',
    version: 'main',
  },
  riptide: {
    name: 'FRC 4451 Riptide2025',
    base: 'https://github.com/frc4451/Riptide2025/blob/main/',
    version: 'main',
  },
  ember: {
    name: 'FRC 4451 Ember2024',
    base: 'https://github.com/frc4451/Ember2024/blob/main/',
    version: 'main',
  },
  'mech-adv': {
    name: 'Team 6328 RobotCode2025Public',
    base: 'https://github.com/Mechanical-Advantage/RobotCode2025Public/blob/main/',
    version: 'main',
  },
  wpilib: {
    name: 'WPILib docs',
    base: 'https://docs.wpilib.org/en/stable/',
    version: '2026',
  },
  'wpilib-javadoc': {
    name: 'WPILib Java API',
    base: 'https://github.wpilib.org/allwpilib/docs/release/java/',
    version: '2026',
  },
  ctre: {
    name: 'CTRE Phoenix 6 docs',
    base: 'https://v6.docs.ctr-electronics.com/en/latest/',
    version: '26.1.0',
  },
  'ctre-javadoc': {
    name: 'CTRE Phoenix 6 Java API',
    base: 'https://api.ctr-electronics.com/phoenix6/latest/java/',
    version: '26.1.0',
  },
  rev: {
    name: 'REV docs',
    base: 'https://docs.revrobotics.com/',
    version: '2026',
  },
  revlib: {
    name: 'REVLib Java API',
    base: 'https://codedocs.revrobotics.com/java/',
    version: '2026',
  },
  photonvision: {
    name: 'PhotonVision docs',
    base: 'https://docs.photonvision.org/en/latest/',
    version: 'PhotonLib 2026.1.1',
  },
  'photonlib-javadoc': {
    name: 'PhotonLib Java API',
    base: 'https://javadocs.photonvision.org/',
    version: 'PhotonLib 2026.1.1',
  },
  questnav: {
    name: 'QuestNav docs',
    base: 'https://questnav.gg/',
    version: 'QuestNavLib 2026-2.2.0',
  },
  thrifty: {
    name: 'Thrifty Bot docs',
    base: 'https://docs.thethriftybot.com/',
    version: 'ThriftyLib 2026.0.1',
  },
  advantagekit: {
    name: 'AdvantageKit docs',
    base: 'https://docs.advantagekit.org/',
    version: '26.0.2',
  },
  advantagescope: {
    name: 'AdvantageScope docs',
    base: 'https://docs.advantagescope.org/',
    version: '2026',
  },
  pathplanner: {
    name: 'PathPlanner docs',
    base: 'https://pathplanner.dev/',
    version: 'PathPlannerLib 2026.1.2',
  },
  choreo: {
    name: 'Choreo docs',
    base: 'https://choreo.autos/',
    version: 'ChoreoLib 2026',
  },
  bline: {
    name: 'BLine docs',
    base: 'https://bline-docs.pages.dev/',
    version: 'BLine-Lib 0.8.4',
  },
  'maple-sim': {
    name: 'maple-sim docs',
    base: 'https://shenzhen-robotics-alliance.github.io/maple-sim/',
    version: '2026',
  },
  'java-api': {
    name: 'Java SE 25 API',
    base: 'https://docs.oracle.com/en/java/javase/25/docs/api/',
    version: 'Java 25',
  },
  jls: {
    name: 'Java Language Specification',
    base: 'https://docs.oracle.com/javase/specs/jls/se25/html/',
    version: 'SE 25',
  },
  'dev-java': {
    name: 'dev.java tutorials',
    base: 'https://dev.java/learn/',
    version: '2026',
  },
  'java-tutorial': {
    name: 'Oracle Java Tutorials',
    base: 'https://docs.oracle.com/javase/tutorial/',
    version: 'Java 8 era, still accurate for the basics',
  },
  csce145: {
    name: 'USC CSCE 145',
    base: 'https://www.cse.sc.edu/~shephejj/csce145/',
    version: 'course site',
  },
  csce146: {
    name: 'USC CSCE 146',
    base: 'https://www.cse.sc.edu/~shephejj/csce146/',
    version: 'course site',
  },
  git: {
    name: 'Git documentation',
    base: 'https://git-scm.com/',
    version: '2.x',
  },
  github: {
    name: 'GitHub Docs',
    base: 'https://docs.github.com/en/',
    version: '2026',
  },
  vscode: {
    name: 'Visual Studio Code docs',
    base: 'https://code.visualstudio.com/docs/',
    version: '2026',
  },
  powershell: {
    name: 'Microsoft PowerShell docs',
    base: 'https://learn.microsoft.com/en-us/powershell/',
    version: '7.x',
  },
  'ms-learn': {
    name: 'Microsoft Learn',
    base: 'https://learn.microsoft.com/en-us/',
    version: '2026',
  },
  adoptium: {
    name: 'Eclipse Adoptium',
    base: 'https://adoptium.net/',
    version: 'Temurin 25',
  },
  'first-manual': {
    name: 'FIRST game and season materials',
    base: 'https://www.firstinspires.org/',
    version: '2026',
  },
} as const satisfies Record<string, SourceDefinition>;

export type SourceId = keyof typeof sourceRegistry;
