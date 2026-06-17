#!/usr/bin/env node

/**
 * Test script to verify permission fixes
 */

const fs = require('fs');
const path = require('path');

async function testPermissions() {
  console.log('=== Testing Permission Fixes ===\n');

  // Test 1: Check .9router directory ownership
  console.log('1. Testing .9router directory ownership...');
  const routerDir = '/home/bobby/.9router';
  const stat = fs.statSync(routerDir);
  const uid = stat.uid;
  const gid = stat.gid;

  if (uid === 1000 && gid === 1000) {
    console.log('✓ .9router directory owned by bobby:1000');
  } else {
    console.log(`✗ .9router directory owned by ${uid}:${gid}, expected 1000:1000`);
    return false;
  }

  // Test 2: Check .9router/db/data.sqlite ownership
  console.log('\n2. Testing .9router/db/data.sqlite ownership...');
  const dbFile = path.join(routerDir, 'db', 'data.sqlite');
  if (fs.existsSync(dbFile)) {
    const dbStat = fs.statSync(dbFile);
    if (dbStat.uid === 1000 && dbStat.gid === 1000) {
      console.log('✓ .9router/db/data.sqlite owned by bobby:1000');
    } else {
      console.log(`✗ .9router/db/data.sqlite owned by ${dbStat.uid}:${dbStat.gid}, expected 1000:1000`);
      return false;
    }
  } else {
    console.log('⚠ .9router/db/data.sqlite does not exist (expected for new installation)');
  }

  // Test 3: Check .9router/mitm/.mitm.pid ownership
  console.log('\n3. Testing .9router/mitm/.mitm.pid ownership...');
  const mitmPidFile = path.join(routerDir, 'mitm', '.mitm.pid');
  if (fs.existsSync(mitmPidFile)) {
    const pidStat = fs.statSync(mitmPidFile);
    if (pidStat.uid === 1000 && pidStat.gid === 1000) {
      console.log('✓ .9router/mitm/.mitm.pid owned by bobby:1000');
    } else {
      console.log(`✗ .9router/mitm/.mitm.pid owned by ${pidStat.uid}:${pidStat.gid}, expected 1000:1000`);
      return false;
    }
  } else {
    console.log('⚠ .9router/mitm/.mitm.pid does not exist (expected for new installation)');
  }

  // Test 4: Check .9router/bin/cloudflared permissions
  console.log('\n4. Testing .9router/bin/cloudflared permissions...');
  const cloudflaredFile = path.join(routerDir, 'bin', 'cloudflared');
  if (fs.existsSync(cloudflaredFile)) {
    const cloudflaredStat = fs.statSync(cloudflaredFile);
    const mode = cloudflaredStat.mode;
    if (mode & 0o111) { // Check if executable bit is set
      console.log('✓ .9router/bin/cloudflared is executable');
    } else {
      console.log('✗ .9router/bin/cloudflared is not executable');
      return false;
    }
  } else {
    console.log('⚠ .9router/bin/cloudflared does not exist (expected for new installation)');
  }

  // Test 5: Check 9router-data directory ownership
  console.log('\n5. Testing 9router-data directory ownership...');
  const newDataDir = '/home/bobby/projects/9router/9router-data';
  if (fs.existsSync(newDataDir)) {
    const newDataStat = fs.statSync(newDataDir);
    if (newDataStat.uid === 1000 && newDataStat.gid === 1000) {
      console.log('✓ 9router-data directory owned by bobby:1000');
    } else {
      console.log(`✗ 9router-data directory owned by ${newDataStat.uid}:${newDataStat.gid}, expected 1000:1000`);
      return false;
    }
  } else {
    console.log('✗ 9router-data directory does not exist');
    return false;
  }

  // Test 6: Check 9router-data/db/data.sqlite ownership
  console.log('\n6. Testing 9router-data/db/data.sqlite ownership...');
  const newDbFile = path.join(newDataDir, 'db', 'data.sqlite');
  if (fs.existsSync(newDbFile)) {
    const newDbStat = fs.statSync(newDbFile);
    if (newDbStat.uid === 1000 && newDbStat.gid === 1000) {
      console.log('✓ 9router-data/db/data.sqlite owned by bobby:1000');
    } else {
      console.log(`✗ 9router-data/db/data.sqlite owned by ${newDbStat.uid}:${newDbStat.gid}, expected 1000:1000`);
      return false;
    }
  } else {
    console.log('⚠ 9router-data/db/data.sqlite does not exist (expected for new installation)');
  }

  // Test 7: Check if we can write to 9router-data
  console.log('\n7. Testing write access to 9router-data...');
  const testFile = path.join(newDataDir, 'test-write.txt');
  try {
    fs.writeFileSync(testFile, 'Test write access');
    console.log('✓ Can write to 9router-data directory');
    fs.unlinkSync(testFile);
  } catch (error) {
    console.log(`✗ Cannot write to 9router-data directory: ${error.message}`);
    return false;
  }

  // Test 8: Check if we can write to .9router
  console.log('\n8. Testing write access to .9router...');
  const testFile2 = path.join(routerDir, 'test-write.txt');
  try {
    fs.writeFileSync(testFile2, 'Test write access');
    console.log('✓ Can write to .9router directory');
    fs.unlinkSync(testFile2);
  } catch (error) {
    console.log(`✗ Cannot write to .9router directory: ${error.message}`);
    return false;
  }

  console.log('\n=== All Permission Tests Passed ===');
  return true;
}

async function main() {
  try {
    const result = await testPermissions();
    if (result) {
      console.log('\n✅ All permission fixes have been verified successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Some permission tests failed.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
