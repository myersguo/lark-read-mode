// build.js
const fs = require('fs');
const path = require('path');
const Terser = require('terser');
const archiver = require('archiver');

const config = {
  srcDir: './src',
  distDir: './dist',
  zipFileName: './zip/lark-wiki-autoread.zip',
  staticFiles: ['manifest.json', 'popup.html', 'options.html', 'icons'],
  jsFiles: [
    { name: 'content.js', isServiceWorker: false },
    { name: 'popup.js', isServiceWorker: false },
    { name: 'options.js', isServiceWorker: false }
  ],
  terserOptions: {
    compress: true,
    mangle: true,
  }
};

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }

  const files = fs.readdirSync(source);
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyFolderSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
  fs.copyFileSync(
    path.join(config.srcDir, 'background.js'),
    path.join(config.distDir, 'background.js')
  );
}

function cleanDir(directory) {
  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  fs.mkdirSync(directory, { recursive: true });
}

async function minifyJSFile(sourcePath, targetPath) {
  const code = fs.readFileSync(sourcePath, 'utf8');
  const result = await Terser.minify(code, config.terserOptions);
  ensureDirectoryExistence(targetPath);
  fs.writeFileSync(targetPath, result.code || '');
  console.log(`minify finished: ${sourcePath} -> ${targetPath}`);
}

function createZip(source, output) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(output);

    archive.on('error', err => reject(err));
    stream.on('close', () => resolve());

    archive.pipe(stream);
    archive.directory(source, false);
    archive.finalize();
  });
}

async function build() {
  try {
    cleanDir(config.distDir);
    console.log(`finish clean: ${config.distDir}`);

    for (const file of config.staticFiles) {
      const srcPath = path.join(config.srcDir, file);
      const distPath = path.join(config.distDir, file);
      
      if (fs.existsSync(srcPath)) {
        if (fs.lstatSync(srcPath).isDirectory()) {
          copyFolderSync(srcPath, distPath);
        } else {
          ensureDirectoryExistence(distPath);
          fs.copyFileSync(srcPath, distPath);
        }
        console.log(`finish copy: ${file}`);
      }
    }

    for (const file of config.jsFiles) {
      const srcPath = path.join(config.srcDir, file.name);
      const distPath = path.join(config.distDir, file.name);
      
      if (fs.existsSync(srcPath)) {
        await minifyJSFile(srcPath, distPath);
      }
    }

    const zipPath = path.join('.', config.zipFileName);
    await createZip(config.distDir, zipPath);
    console.log(`create zip file finished: ${zipPath} (${(fs.statSync(zipPath).size / 1024).toFixed(2)} KB)`);

    console.log('build done!');
  } catch (error) {
    console.error('build error:', error);
  }
}

build();
