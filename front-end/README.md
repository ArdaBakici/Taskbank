## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

## Installation

1. **Clone the repository**
   * Clone this repository to your local machine and navigate into the project directory
```bash
   git clone https://github.com/agile-students-fall2025/4-final-taskbank.git
   cd 4-final-taskbank
```

2. **Install dependencies**
   * Navigate into the front-end directory
   * Run `npm install` to install all dependencies listed in the package.json file.
```bash
   cd front-end
   npm install
```


## Running the Application

1. **Start the development server**
   * Run `npm start` in the front-end directory to launch the React.js server
```bash
   npm start
```

2. **Open your browser** and navigate to:
```
   http://localhost:3000
```

   The application should automatically open in your default browser. If not, manually navigate to the URL above.

3. **The page will automatically reload** when you make changes to the code.

## Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## Troubleshooting

### Port 3000 is already in use
If you see an error that port 3000 is already in use:
```bash
# Kill the process using port 3000
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### npm install fails
Try clearing npm cache:
```bash
npm cache clean --force
npm install
```

### Changes not reflecting
Clear your browser cache or try hard refresh:
- **Mac:** Cmd + Shift + R
- **Windows/Linux:** Ctrl + Shift + R

## Need Help?

- Open an issue on GitHub
- Contact the team on Discord