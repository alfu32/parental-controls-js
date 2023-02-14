import { spawn } from 'node:child_process';
import process from 'node:process';

export declare type SpawnProcessResult = { out: string; error: string; }

export function spawnProcess(
  command: string,
  args: string[],
  options: { [key: string]: any; } = { cwd: undefined, env: process.env }): Promise<SpawnProcessResult> {
  return new Promise((resolve, reject) => {
    const cmd = spawn(command, args, options);
    let error = "";
    let out = "";
    cmd.stdout.on('data', (data) => {
      out += data;
    });

    cmd.stderr.on('data', (data) => {
      error += data;
    });
    cmd.on('close', (code) => {
      if(code !== 0) {
        console.log(`${command} exited with code ${code}`);
        console.log(`COMMAND was ${command} ${args.join(" ")}`);
        reject({ out, error });
      } else {
        resolve({ out, error });
      }
    });
  });
}
