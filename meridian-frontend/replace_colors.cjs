const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Backgrounds
  content = content.replace(/bg-white/g, 'bg-black');
  content = content.replace(/bg-\[\#f7f8f8\]/g, 'bg-black');
  content = content.replace(/bg-gray-50/g, 'bg-[#111]');
  content = content.replace(/bg-gray-100/g, 'bg-[#222]');
  
  // Texts
  content = content.replace(/text-ink/g, 'text-[#EAECEC]');
  content = content.replace(/text-gray-900/g, 'text-[#EAECEC]');
  content = content.replace(/text-gray-800/g, 'text-[#EAECEC]');
  content = content.replace(/text-gray-700/g, 'text-[#999B9B]');
  content = content.replace(/text-gray-600/g, 'text-[#999B9B]');
  content = content.replace(/text-gray-500/g, 'text-[#999B9B]');
  
  // Borders
  content = content.replace(/border-surface/g, 'border-[#333]');
  content = content.replace(/border-neutral-300/g, 'border-[#333]');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
