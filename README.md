
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Clone the Repository

```bash
git clone https://github.com/phyowan/job-application-tracker-ui.git


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\


## Configuration

### API Configuration

The application communicates with a backend API. You need to configure the API URL in the environment file.

#### Environment Variables

1. **Copy or create the `.env` file** in the project root:
```
REACT_APP_API_BASE_URL=http://localhost:5212/api
REACT_APP_API_TIMEOUT=10000
```

2. **Update the API URL** to match your backend server:

**For Local Development:**
```
REACT_APP_API_BASE_URL=http://localhost:5212/api



