import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { Pool } from 'pg';

const sourceUri = process.env.DB_SOURCE_URI; // URI for the source database
const destUri = process.env.DB_DEST_URI; // URI for the destination database

// pg_dump command to run on the source database
const backupCmd = `pg_dump -Fc ${sourceUri}`;

// pg_restore command to run on the destination database
const restoreCmd = `pg_restore --clean --if-exists --dbname=${destUri}`;

async function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function main() {
  try {
    // Run backup command on the source database
    const backupResult = await runCommand(backupCmd);
    console.log(`Backup of '${sourceUri}' database created.`);

    // Transfer backup file to the local machine
    const backupPath = `/tmp/${new Date().getTime()}.backup`;
    await writeFile(backupPath, backupResult.stdout, 'binary');
    console.log(`Backup of '${sourceUri}' database saved to ${backupPath}.`);

    // Restore backup file on the destination database
    const pool = new Pool({ connectionString: destUri });
    await pool.query('DROP SCHEMA IF EXISTS public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await pool.query(restoreCmd, [backupPath]);
    await pool.end();
    console.log(`Backup of '${sourceUri}' database restored to '${destUri}' database.`);

    // Delete backup file from the local machine
    await unlink(backupPath);
    console.log(`Backup file deleted from the local machine.`);
  } catch (err) {
    console.error(err);
  }
}

main();
