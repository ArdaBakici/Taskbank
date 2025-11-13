# Contributing to Taskbank

 This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Team Norms](#team-norms)
- [Git Workflow](#git-workflow)
- [Development Environment Setup](#development-environment-setup)
- [Coding Standards](#coding-standards)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Building and Testing](#building-and-testing)

## Team Norms

### Team Values

- **Respect**: We value every team member's ideas and contributions
- **Communication**: We communicate openly, honestly, and frequently
- **Collaboration**: We work together and help each other succeed
- **Quality**: We take pride in writing clean, maintainable code
- **Accountability**: We own our work and meet our commitments

### Communication Guidelines

- **Response Time**: Respond to Discord messages within 24 hours
- **Availability**: Update the team if you'll be unavailable
- **Standups**: Attend all scheduled standup meetings (or provide async updates)
- **Meetings**: Be on time and come prepared
- **Blockers**: Communicate blockers immediately, don't wait

### Work Expectations

- **Commit Regularly**: Push code at least once between standup meetings
- **Pull Requests**: Submit PRs early and often; don't wait until the last minute
- **Code Reviews**: Review assigned PRs within 24 hours
- **Task Updates**: Update task status on the project board daily
- **Testing**: Write tests for your code before submitting PRs
- **Documentation**: Update documentation as you make changes

### Conflict Resolution

- Address conflicts directly and respectfully
- If unresolved, escalate to the Scrum Master
- Focus on the problem, not the person
- Assume positive intent

### Estimation of Effort

To estimate the amount of effort that is needed for a user story, we use the planning poker with values 0,1,2,3,5,8,13,20,40 and 100. Higher value indicated higher complexity out of 100.

## Git Workflow

We follow the **Feature Branch Workflow** with the following practices:

### Branch Structure

- **`main`**: Production-ready code, always deployable
- **Feature branches**: All development happens in feature branches

### Branch Naming Convention

Use descriptive names with the following format:

```
<type>/<issue-number>-<short-description>

Examples:
feature/7-add-task-form
fix/23-date-picker-bug
spike/5-mongodb-setup
```

**Types:**
- `feature/` - New feature implementation
- `fix/` - Bug fixes
- `spike/` - Research or investigation tasks
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Adding or updating tests

### Workflow Steps

1. **Pull latest changes**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/7-add-task-form
   ```

3. **Make your changes**
   - Write code
   - Write tests
   - Test locally

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add task creation form with validation"
   ```

5. **Push to GitHub**
   ```bash
   git push origin feature/7-add-task-form
   ```

6. **Create a Pull Request**
   - Go to GitHub
   - Click "Compare & pull request"
   - Fill out the PR template
   - Request reviews from at least 2 team members

7. **Address review feedback**
   - Make requested changes
   - Push additional commits to the same branch
   - Re-request review

8. **Merge**
   - Once approved, the PR author merges the branch
   - Delete the feature branch after merging

### Commit Message Guidelines

Write clear, descriptive commit messages:

**Format:**
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: Add task priority selector component

fix: Resolve date picker timezone bug

docs: Update installation instructions in README

test: Add unit tests for task sorting algorithm
```

**Guidelines:**
- Use imperative mood ("Add feature" not "Added feature")
- Keep subject line under 50 characters
- Capitalize the subject line
- Don't end subject with a period
- Use the body to explain what and why, not how

## Development Environment Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - Choose one:
  - Local: [Download MongoDB Community](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/taskbank.git
   cd taskbank
   ```

2. **Install backend dependencies and setup environment variables**
   ```bash
   cd back-end
   cp .env.example .env
   npm install
   ```

3. **Install frontend dependencies and setup environment variables**
   ```bash
   cd front-end
   cp .env.example .env
   npm install
   ```

4. **Environment variables example**
   
   In the `back-end/` directory:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/taskbank
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskbank
   
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_here
   ```
   
   In the `front-end` directory:
   ```env
   REACT_APP_API_URL=http://localhost:4000/api
   ```

5. **Start MongoDB** (if using local installation)
   ```bash
   # On macOS/Linux
   mongod
   
   # On Windows
   # MongoDB should start automatically as a service
   ```

6. **Verify your setup**
   ```bash
   # Terminal 1: Start backend
   npm run dev
   
   # Terminal 2: Start frontend
   cd front-end
   npm start
   ```
   
   - Backend should run on: http://localhost:4000/api
   - Frontend should open: http://localhost:3000
   - Alternatively, frontend if you ran in `back-end/` the command `npm run ui:build`, http://localhost:4000/ also serves that build React app.

### Recommended VS Code Extensions

- ESLint
- Prettier
- ES7+ React/Redux/React-Native snippets
- MongoDB for VS Code
- GitLens

### Configure Git Username

Ensure your git username matches your GitHub username:

```bash
# Check current username
git config user.name

# Set username if needed
git config --global user.name "your-github-username"
```

## Coding Standards

### JavaScript/React Style Guide

We follow standard JavaScript and React best practices:

**General JavaScript:**
- Use `const` and `let`, never `var`
- Use arrow functions for callbacks
- Use template literals for string concatenation
- Use async/await instead of promises when possible
- Always use semicolons

**React Specific:**
- Use functional components with hooks
- One component per file
- Use PascalCase for component names
- Use camelCase for variables and functions
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks

**Example:**
```javascript
// Good
const TaskList = ({ tasks, onTaskComplete }) => {
  const [filter, setFilter] = useState('all');
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filter === 'all') return true;
      return task.status === filter;
    });
  }, [tasks, filter]);
  
  return (
    <div className="task-list">
      {filteredTasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onComplete={onTaskComplete}
        />
      ))}
    </div>
  );
};
```

### File Naming

- **Components**: PascalCase - `TaskList.js`, `TaskForm.js`
- **Utilities**: camelCase - `dateHelpers.js`, `apiClient.js`
- **Styles**: Match component name - `TaskList.css`
- **Tests**: Match file with `.test.js` - `TaskList.test.js`

### Project Structure

```
client/src/
├── components/        # Reusable UI components
├── pages/            # Page-level components
├── hooks/            # Custom React hooks
├── services/         # API calls and external services
├── utils/            # Helper functions
├── styles/           # Global styles
└── App.js

server/
├── models/           # Mongoose schemas
├── routes/           # Express routes
├── controllers/      # Route handlers
├── middleware/       # Custom middleware
├── utils/            # Helper functions
└── server.js
```

### Code Formatting

We use **Prettier** for automatic code formatting:

- Install Prettier extension in VS Code
- Format on save should be enabled
- Configuration is in `.prettierrc`

### Linting

We use **ESLint** to catch errors:

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

## How to Contribute

### Working on Issues

1. **Choose an issue** from the Sprint Backlog assigned to you
2. **Move it to "In Progress"** on the project board
3. **Create a feature branch** following naming conventions
4. **Implement the feature/fix**
5. **Write tests** for your code
6. **Update documentation** if needed
7. **Submit a Pull Request**

### Creating Issues

If you find a bug or have a feature idea:

1. Check if an issue already exists
2. Create a new issue with:
   - Clear, descriptive title
   - Detailed description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots if applicable
   - Appropriate labels

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] Added tests for new features
- [ ] Updated documentation
- [ ] No console.log() or debugging code left in
- [ ] Committed with meaningful messages

### Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Related Issue
Closes #[issue number]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Tests pass locally
- [ ] Documentation updated
```

### Review Process

**For Authors:**
- Request at least 2 reviewers
- Respond to feedback within 24 hours
- Make requested changes promptly
- Be open to constructive criticism

**For Reviewers:**
- Review within 24 hours of request
- Be constructive and respectful
- Test the changes locally if significant
- Approve only when satisfied with quality

**Approval Requirements:**
- At least 2 approvals required
- All conversations resolved
- All checks passing (tests, linting)
- No merge conflicts

### Merging

- Author merges after approval (not reviewers)
- Use "Squash and merge" for clean history
- Delete branch after merging

## Building and Testing

**Note:** This section will be updated once the project development reaches the building and testing stage. Check back soon for detailed instructions.

### Running the Development Server

*Instructions will be added once the initial project structure is set up.*

Expected setup will include:
- Backend server running on http://localhost:5000
- Frontend development server running on http://localhost:3000

### Running Tests

*Testing instructions will be added once the test framework is configured.*

### Building for Production

*Production build instructions will be added once deployment strategy is finalized.*

## Questions?

If you have questions or need help:

1. Check this document first
2. Search existing GitHub issues
3. Ask in the team Discord channel
4. Reach out to the **[Scrum Master](https://github.com/sihyunlkim)** 
5. Contact the **[Product Owner](https://github.com/ArdaBakici)** 

