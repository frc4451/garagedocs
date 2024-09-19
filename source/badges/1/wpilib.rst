WPILib Installation
======================================

WPILib is the FOSS solution for acting as the controls software for FRC that ROBOTZ Garage will use. Alternatives include NI's LabView, and RobotPy.

Written in C++, with interfaces for Java, it acts as a software controller deployed to the RoboRIO to interface with motors, sensors, network tables, coprocessors, etc.
The RoboRIO uses a minimal operating system to accept robot code. At a top level, WPILib will tell the robot what to do. 
WPILib includes definitions for the majority of FRC-standard components, in addition to the structure needed to help integrate third-party solutions.

Versions of WPILib use the `YYYY.MM.<patch number>` structure. Make sure that the version of WPILib you install is the year you plan to support. In pre-season, use the latest version. 

It is recommended that you install WPILib on your personal computer in order to contribute from home. We will discuss robots-at-home later in Badge 1.

https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html

We will follow the WPILib documentation for additional context to lessons learned. Make sure you are capable of navigating the WPILib documentation.