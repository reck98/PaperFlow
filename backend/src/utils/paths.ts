import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function findBinary(binaryName: string, windowsExeName: string): string {
  // 1. Check explicit environment variable
  const envVar = binaryName.toUpperCase() + '_PATH';
  if (process.env[envVar] && fs.existsSync(process.env[envVar]!)) {
    return process.env[envVar]!;
  }

  // 2. Check local workspace bin folder (for Windows or bundled builds)
  const isWindows = process.platform === 'win32';
  const targetExe = isWindows ? windowsExeName : binaryName;

  // Search up to 3 levels up for a 'bin' directory
  const candidateDirs = [
    path.resolve(process.cwd(), 'bin'),
    path.resolve(process.cwd(), '..', 'bin'),
    path.resolve(__dirname, '../../../bin'),
    path.resolve(__dirname, '../../bin'),
  ];

  for (const dir of candidateDirs) {
    const candidatePath = path.join(dir, targetExe);
    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  // 3. Check system PATH
  try {
    const cmd = isWindows ? `where.exe ${targetExe}` : `which ${binaryName}`;
    const output = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    const firstLine = output.split('\n')[0].trim();
    if (firstLine && fs.existsSync(firstLine)) {
      return firstLine;
    }
  } catch {
    // ignore
  }

  // 4. Default fallback to binary name assuming it's in PATH
  return targetExe;
}

export const PANDOC_BIN = findBinary('pandoc', 'pandoc.exe');
export const TYPST_BIN = findBinary('typst', 'typst.exe');

export function checkBinaries(): { pandoc: boolean; typst: boolean; pandocPath: string; typstPath: string } {
  let pandocOk = false;
  let typstOk = false;

  try {
    execSync(`"${PANDOC_BIN}" --version`, { stdio: 'ignore' });
    pandocOk = true;
  } catch {}

  try {
    execSync(`"${TYPST_BIN}" --version`, { stdio: 'ignore' });
    typstOk = true;
  } catch {}

  return {
    pandoc: pandocOk,
    typst: typstOk,
    pandocPath: PANDOC_BIN,
    typstPath: TYPST_BIN,
  };
}
