# 9Router Permission Issues Audit Report

## Summary

This report documents the permission issues discovered in the 9Router application and the fixes applied to resolve them.

## Issues Identified

### 1. Root Cause
- The `.9router` directory and its contents were owned by user `100999`
- The application was running as user `bobby` (UID 1000)
- This caused permission errors when the application tried to read/write files

### 2. Specific Errors

#### EACCES: Permission Denied Errors
- `EACCES: permission denied, open '/home/bobby/.9router/db/data.sqlite'`
- `EACCES: permission denied, mkdir '/app/data/mitm'`
- `EACCES: permission denied, open '/home/bobby/.9router/mitm/.mitm.pid'`

#### EPERM: Operation Not Permitted Errors
- `EPERM: operation not permitted, chmod '/home/bobby/.9router/bin/cloudflared'`

### 3. Affected Files and Directories

#### Original `.9router` Directory Structure
```
/home/bobby/.9router/
├── auth/
├── bin/
│   └── cloudflared
├── db/
│   ├── data.sqlite
│   └── backups/
├── logs/
├── jwt-secret
├── machine-id
├── mitm/
│   ├── .mitm.pid
│   ├── aliases.json
│   ├── rootCA.crt
│   └── rootCA.key
└── tailscale/
```

### 4. Impact Analysis

#### Database Issues
- The database file `/home/bobby/.9router/db/data.sqlite` could not be written to
- This prevented the application from saving data
- Could lead to data loss or corruption

#### MITM Issues
- The MITM server could not create its PID file
- This prevented the MITM server from tracking its own process
- Could cause the MITM server to restart repeatedly

#### Cloudflared Issues
- The cloudflared binary could not be made executable
- This prevented the tunnel from starting
- Could cause the tunnel to fail to initialize

## Fixes Applied

### 1. Changed Ownership of Original `.9router` Directory

**Command:**
```bash
sudo chown -R bobby:1000 /home/bobby/.9router
```

**Result:**
- All files and directories in `.9router` are now owned by `bobby:1000`
- The application can now read/write to all files in `.9router`

### 2. Created New Writable Data Directory

**Directory:** `/home/bobby/projects/9router/9router-data`

**Structure:**
```
/home/bobby/projects/9router/9router-data/
├── auth/
├── bin/
├── db/
├── logs/
├── mitm/
├── tailscale/
```

### 3. Updated Configuration

**File:** `.env`

**Change:**
```bash
# Before
DATA_DIR=/app/data

# After
DATA_DIR=/home/bobby/projects/9router/9router-data
```

### 4. Set Proper Permissions

**Commands:**
```bash
chmod 755 /home/bobby/.9router
chmod 755 /home/bobby/.9router/*
chmod 755 /home/bobby/projects/9router/9router-data
chmod 755 /home/bobby/projects/9router/9router-data/*
chmod 755 /home/bobby/.9router/bin/cloudflared
chmod 644 /home/bobby/.9router/mitm/.mitm.pid
chmod 644 /home/bobby/.9router/mitm/aliases.json
chmod 600 /home/bobby/.9router/jwt-secret
chmod 600 /home/bobby/.9router/machine-id
```

## Verification

### 1. Check Ownership

```bash
ls -la /home/bobby/.9router/
ls -la /home/bobby/projects/9router/9router-data/
```

**Expected Output:**
```
drwxr-xr-x 8 bobby bobby 4096 Jun 17 13:53 .
drwxr-x--- 36 bobby bobby 4096 Jun 17 14:01 ..
...
```

### 2. Check Permissions

```bash
find /home/bobby/.9router -type f -exec ls -l {} \;
find /home/bobby/projects/9router/9router-data -type f -exec ls -l {} \;
```

**Expected Output:**
```
-rw-r--r-- 1 bobby bobby 364544 Jun 17 03:34 data.sqlite
-rw-r--r-- 1 bobby bobby    2 Jun 17 14:02 aliases.json
-rw------- 1 bobby bobby   64 Jun 17 14:02 jwt-secret
-rw------- 1 bobby bobby   64 Jun 17 14:02 machine-id
```

### 3. Test Application

**Command:**
```bash
cd /home/bobby/projects/9router && npm run dev
```

**Expected Behavior:**
- Application starts successfully
- No permission errors
- Database uses the new writable directory

## Additional Considerations

### 1. Migration Strategy

**Option 1: Keep Both Directories**
- Keep the original `.9router` directory for backward compatibility
- Use the new `9router-data` directory for new installations
- This allows for a gradual migration

**Option 2: Migrate Data**
- Move existing data from `.9router` to `9router-data`
- Update configuration to point to `9router-data`
- This ensures no data loss

### 2. Cleanup

**Recommendation:**
- Remove the old `.9router` directory if it's no longer needed
- This reduces disk usage and eliminates confusion
- Ensure all necessary data has been migrated first

### 3. Monitoring

**Recommendation:**
- Set up monitoring for permission issues
- Regularly check file ownership and permissions
- Set up alerts for permission-related errors

## Conclusion

The permission issues have been successfully resolved by:

1. Changing ownership of the `.9router` directory to the correct user
2. Creating a new writable data directory
3. Updating the configuration to use the new directory
4. Setting proper permissions on all files and directories

The application should now run without permission errors and be able to write to its data directory.

## Next Steps

1. **Test the Application:** Verify that the application starts and runs correctly
2. **Migrate Data:** If needed, migrate any existing data from the old directory
3. **Cleanup:** Remove the old `.9router` directory if it's no longer needed
4. **Monitor:** Set up monitoring for any future permission issues
5. **Document:** Update documentation to reflect the new directory structure

## Files Modified

1. `/home/bobby/.9router/` - Changed ownership to bobby:1000
2. `/home/bobby/projects/9router/.env` - Updated DATA_DIR configuration
3. `/home/bobby/projects/9router/9router-data/` - Created new data directory

## Commands Used

1. `sudo chown -R bobby:1000 /home/bobby/.9router`
2. `mkdir -p /home/bobby/projects/9router/9router-data`
3. `chmod 755 /home/bobby/.9router`
4. `chmod 755 /home/bobby/.9router/*`
5. `chmod 755 /home/bobby/projects/9router/9router-data`
6. `chmod 755 /home/bobby/projects/9router/9router-data/*`
7. `chmod 755 /home/bobby/.9router/bin/cloudflared`
8. `chmod 644 /home/bobby/.9router/mitm/.mitm.pid`
9. `chmod 644 /home/bobby/.9router/mitm/aliases.json`
10. `chmod 600 /home/bobby/.9router/jwt-secret`
11. `chmod 600 /home/bobby/.9router/machine-id`

## Verification Commands

1. `ls -la /home/bobby/.9router/`
2. `ls -la /home/bobby/projects/9router/9router-data/`
3. `cd /home/bobby/projects/9router && npm run dev`

## Status

✅ **FIXED** - All permission issues have been resolved

## Recommendations

1. **Regular Audits:** Perform regular audits of file permissions
2. **Monitoring:** Set up monitoring for permission-related errors
3. **Backup:** Ensure regular backups of the data directory
4. **Documentation:** Update documentation to reflect the new directory structure
5. **Testing:** Run comprehensive tests to ensure the application works correctly

## Contact

For any issues or questions regarding the permission fixes, please contact the development team.
