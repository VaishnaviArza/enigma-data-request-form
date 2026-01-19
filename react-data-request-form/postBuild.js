const fs = require('fs-extra');
const path = require('path');

// Set up paths
const projectRoot = path.resolve(__dirname, '..'); // Navigate to the root directory of your project
const reactBuildDir = path.join(projectRoot, 'react-data-request-form', 'build');
const flaskStaticDir = path.join(projectRoot, 'static');
const reactBuildStaticDir = path.join(reactBuildDir, 'static');
const flaskDataDir = path.join(flaskStaticDir, 'anonymized_data');

async function moveFiles() {
  try {
    // Check if the `static/js` and `static/css` directories exist in the build folder
    const staticDirsExist = await fs.pathExists(reactBuildStaticDir);
    
    if (!staticDirsExist) {
      console.log('The `static` directory does not exist in the build folder, skipping move.');
      return;
    }

    // Move JS and CSS folders up one level to the `build` directory
    const subDirs = await fs.readdir(reactBuildStaticDir);
    for (const dir of subDirs) {
      const fullPath = path.join(reactBuildStaticDir, dir);
      const files = await fs.readdir(fullPath);
      for (const file of files) {
        await fs.copy(path.join(fullPath, file), path.join(reactBuildDir, `${dir}/${file}`));
      }
    }

    // Move the entire `build` directory to the Flask `static` directory
    await fs.move(reactBuildDir, path.join(flaskStaticDir, 'build'), { overwrite: true });
    console.log('Moved build folder to the flask static directory.');

    // Copy the `data` directory to the `static/build` directory
    await fs.copy(flaskDataDir, path.join(flaskStaticDir, 'build', 'anonymized_data'));
    console.log('Copied data folder into the build directory.');

  } catch (error) {
    console.error('An error occurred: ', error);
    throw error;
  }
}

moveFiles();
