[![Build](https://img.shields.io/github/actions/workflow/status/ArdaBakici/Taskbank/build-only.yml?branch=main&label=Build)](https://github.com/ArdaBakici/Taskbank/actions/workflows/build-only.yml)
[![Tests](https://img.shields.io/github/actions/workflow/status/ArdaBakici/Taskbank/backend-tests.yml?branch=main&label=Tests)](https://github.com/ArdaBakici/Taskbank/actions/workflows/backend-tests.yml)
[![Publish](https://img.shields.io/github/actions/workflow/status/ArdaBakici/Taskbank/build-and-publish.yml?branch=main&label=Publish)](https://github.com/ArdaBakici/Taskbank/actions/workflows/build-and-deploy.yml)
# Taskbank - Smart Task Planner


## Test Taskbank at → https://tasks.ardabakici.com/


## Product Vision Statement

**For students and busy professionals who struggle to maintain effective todo lists and get overwhelmed by lengthy task backlogs, Taskbank is a web-based smart task planner that automatically generates optimized daily task lists using GTD (Getting Things Done) principles. Unlike traditional todo apps that simply display all tasks, our product intelligently organizes work based on context, priority, deadlines, and dependencies to help users focus on what matters most each day.**

## Project Description

In the digital age with tons of distractions and things to do, it is easy to get lost in endless task lists and digital apps. Taskbank is a web-based todo application that goes beyond simple task management by automatically creating daily task lists tailored to your workload, priorities, and context.

### Key Features

- **Intelligent Task Sorting**: Automatically sorts tasks based on importance, deadlines, and dependencies
- **Context-Based Filtering**: Filter tasks by context (Office, School, Home, Daily Life), location, and custom tags
- **Project Management**: Create projects consisting of multiple interconnected tasks
- **Smart Daily Planning**: Automatically generates optimized daily task lists when you first launch the app each day
- **Customizable Workload**: Adjust the number of tasks in your daily list to match your capacity
- **Time Tracking**: Add estimated effort and time required for each task
- **Gamification**: Track performance stats, completion streaks, and receive grades based on consistency

### Who Is This For?

Taskbank is designed for everyone who needs task management, but specifically targets:
- Students managing coursework, assignments, and extracurricular activities
- Professionals juggling multiple projects and responsibilities
- Anyone who has struggled to maintain consistent todo lists
- People who get overwhelmed by lengthy task backlogs

## Team Members

- **[Arda Bakici](https://github.com/ArdaBakici)** 
- **[Siddhanta Paudel](https://github.com/PaudelSiddhanta)** 
- **[Sihyun Kim](https://github.com/sihyunlkim)** 
- **[Srijan Sthapit](https://github.com/Srijan3141)** 
- **[William Chan](https://github.com/wc2184)** 


## Project History

Taskbank was conceived from the observation that many people struggle with traditional todo list applications. While there are countless task management tools available, most simply present users with an overwhelming list of tasks without guidance on what to focus on each day. 

Our team recognized that the problem isn't tracking tasks - it's prioritizing and organizing them effectively. By combining GTD principles with intelligent automation, Taskbank aims to solve the core problem: helping users maintain sustainable, productive task management habits without feeling overwhelmed.

## Building and Testing

Run these:

- Build: `cd front-end && npm install && npm run build`
- Tests: `cd back-end && npm install && npm test`

## Technology Stack

**MERN Stack**

- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB

### Development Tools
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Development Environment**: Visual Studio Code
- **Hosting**: Nginx
- **Containers & Registry**: Docker for containerization with images published to GHCR


## Additional Resources
- [Product Backlog](https://github.com/orgs/agile-students-fall2025/projects/47/views/6)
- [Sprint 4 Task Board](https://github.com/orgs/agile-students-fall2025/projects/47/views/18)
- [Issue Tracker](https://github.com/orgs/agile-students-fall2025/issues)
- [Initial Project Proposal](https://github.com/agile-students-fall2025/1-project-proposal-igor)

## CI/CD Automation
- Pull requests and branch pushes run the relevant builds/tests automatically when code paths that require them change like the back-end/ and front-end/ folders.
- Any change to `main` (such as merging a feature branch) kicks off a full deploy of the frontend and backend to Digital Ocean and https://taskbank.me will be updated.

---

**Last Updated**: December 10th 2025  
**Project Status**: Sprint 4 - Deployment
