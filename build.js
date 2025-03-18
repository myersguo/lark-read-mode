// build.js
const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
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
  baseObfuscatorOptions: {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.3,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: false,
    unicodeEscapeSequence: false
  },
  serviceWorkerOptions: {
    debugProtection: false,
    debugProtectionInterval: 0,
    domainLock: [],
    reservedNames: ['chrome', 'self', 'navigator', 'location', 'fetch', 'Response', 'Request', 'Headers', 'caches'],
    target: 'browser'
  }
};

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
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
  // copy background
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

// 混淆JS文件
function obfuscateJSFile(sourcePath, targetPath, isServiceWorker) {
  const code = fs.readFileSync(sourcePath, 'utf8');
  
  // 根据文件类型选择混淆选项
  let obfuscatorOptions = { ...config.baseObfuscatorOptions };
  
  // 对于service worker，添加特定选项
  if (isServiceWorker) {
    obfuscatorOptions = { 
      ...obfuscatorOptions, 
      ...config.serviceWorkerOptions
    };
  }
  
  const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, obfuscatorOptions).getObfuscatedCode();
  ensureDirectoryExistence(targetPath);
  fs.writeFileSync(targetPath, obfuscatedCode);
  console.log(`混淆完成: ${sourcePath} -> ${targetPath}${isServiceWorker ? ' (Service Worker)' : ''}`);
}

// 创建ZIP文件
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
        obfuscateJSFile(srcPath, distPath, file.isServiceWorker);
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

// 运行构建
build();
