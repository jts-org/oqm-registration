# Logs Access - General Application Logging

## When to Use

- Application errors or exceptions need investigation
- Debugging unexpected behavior
- Verifying application flow
- Checking for warnings or info messages
- Correlating events across components

## Prerequisites

### Local Development
- Application running with appropriate log level
- Log files accessible in standard locations
- Environment variables configured for logging

### Containerized (Docker)
- Container ID or name
- Docker CLI access
- Container running or logs persisted

### Cloud/Serverless
- Appropriate cloud CLI installed (az, aws, gcloud)
- Access credentials configured
- Log group/stream names known

## Debugging Steps

### 1. Identify Log Location

**Local**:
```bash
# Common log locations
./logs/app.log
./logs/error.log
/var/log/[app-name]/
stdout/stderr (if running in terminal)
```

**Docker**:
```bash
# List containers
docker ps

# View logs
docker logs <container-name>
docker logs --follow <container-name>  # Real-time
docker logs --tail 100 <container-name>  # Last 100 lines
docker logs --since 5m <container-name>  # Last 5 minutes
```

**Kubernetes**:
```bash
# List pods
kubectl get pods -n <namespace>

# View logs
kubectl logs <pod-name> -n <namespace>
kubectl logs --follow <pod-name> -n <namespace>
kubectl logs <pod-name> -c <container> -n <namespace>  # Specific container
kubectl logs --previous <pod-name> -n <namespace>  # Previous instance
```

### 2. Filter and Search Logs

**Using grep**:
```bash
# Search for error
grep -i error app.log

# Search with context (5 lines before/after)
grep -C 5 "exception" app.log

# Search multiple patterns
grep -E "error|warning|exception" app.log

# Case-insensitive, show line numbers
grep -in "failed" app.log
```

**Using tail and grep**:
```bash
# Monitor logs in real-time
tail -f app.log | grep --line-buffered "ERROR"
```

**Using awk for structured logs**:
```bash
# Extract timestamp and message
awk '{print $1, $2, $NF}' app.log

# Filter by time range
awk '$1 >= "2026-02-02T10:00" && $1 <= "2026-02-02T11:00"' app.log
```

### 3. Analyze Patterns

```bash
# Count errors by type
grep "ERROR" app.log | cut -d: -f3 | sort | uniq -c | sort -rn

# Find most common errors
grep "ERROR" app.log | awk '{print $NF}' | sort | uniq -c | sort -rn | head -10

# Time-based analysis (errors per hour)
grep "ERROR" app.log | cut -d: -f1 | uniq -c
```

### 4. Correlate Across Services

```bash
# Search for request ID across multiple logs
grep "request-id-12345" service1.log service2.log service3.log

# Follow request through system
grep -h "request-id-12345" */logs/*.log | sort
```

## Tools

### Standard Unix Tools
- `tail -f`: Real-time log monitoring
- `grep`: Search and filter
- `awk`: Parse structured logs
- `sed`: Transform log output
- `less`: Navigate large log files
- `cat`: Display file contents
- `wc -l`: Count log entries

### Docker Tools
- `docker logs`: Container log access
- `docker logs --timestamps`: Show timestamps
- `docker logs --details`: Show extra details

### Kubernetes Tools
- `kubectl logs`: Pod log access
- `kubectl logs -l app=myapp`: Logs by label
- `stern`: Multi-pod log tailing (if installed)

### Log Level Control

**Environment Variables** (common):
```bash
LOG_LEVEL=debug  # Increase verbosity
LOG_LEVEL=error  # Reduce noise
```

**Application Config**:
```yaml
logging:
  level: debug
  format: json
```

## Common Issues

### Issue: Logs Not Appearing
**Check**:
- Log level set too high (only errors showing)
- Application writing to different location
- Logs buffered (not flushed yet)
- Permissions issue writing logs

**Solution**:
```bash
# Check current log level
echo $LOG_LEVEL

# Increase verbosity
export LOG_LEVEL=debug

# Force flush (application-specific)
kill -USR1 <pid>  # Send signal to flush
```

### Issue: Logs Too Large
**Check**:
- No log rotation configured
- Debug logging in production
- Excessive logging in hot paths

**Solution**:
```bash
# Check log size
du -sh logs/

# Compress old logs
gzip logs/app.log.1

# Tail recent logs only
tail -n 10000 app.log > recent.log
```

### Issue: Missing Context
**Check**:
- Correlation IDs not propagated
- Stack traces truncated
- Timestamps missing

**Solution**:
- Enable structured logging (JSON)
- Add request/trace IDs to log context
- Configure stack trace depth

## Examples

### Example 1: Find Error and Context
```bash
# Find error
grep -n "NullPointerException" app.log
# Output: 1523:ERROR NullPointerException in UserService

# Get context around line 1523
sed -n '1518,1528p' app.log
```

### Example 2: Monitor Real-Time for Specific User
```bash
# Watch logs for user activity
tail -f app.log | grep "userId=12345"
```

### Example 3: Docker Container Debugging
```bash
# Get container logs with timestamps
docker logs --timestamps --tail 100 my-app

# Follow logs and filter errors
docker logs --follow my-app 2>&1 | grep ERROR
```

### Example 4: Extract Error Stats
```bash
# Count errors in last hour
grep $(date -v-1H '+%Y-%m-%d %H') app.log | grep ERROR | wc -l

# Top 5 error types
grep ERROR app.log | cut -d: -f3 | sort | uniq -c | sort -rn | head -5
```

## Integration with Debug Process

### Phase 1: Initial Analysis
Use logs to:
- Verify error occurred
- Get stack trace
- Identify affected component

### Phase 2: Context Gathering
Use logs to:
- Trace request flow
- Check timing/sequencing
- Verify input/output

### Phase 3: Root Cause
Use logs to:
- Confirm hypothesis
- Rule out causes
- Identify exact failure point

### Phase 4: Verification
Use logs to:
- Verify fix applied
- Confirm error doesn't reappear
- Check for new warnings

## Best Practices

### Do:
- ✅ Use structured logging (JSON) when possible
- ✅ Include correlation IDs for distributed tracing
- ✅ Log at appropriate levels (debug, info, warn, error)
- ✅ Add context to log messages
- ✅ Use log aggregation in production
- ✅ Rotate logs to prevent disk fill

### Don't:
- ❌ Log sensitive data (passwords, tokens, PII)
- ❌ Log in tight loops (use sampling)
- ❌ Ignore log levels (debug in prod kills performance)
- ❌ Log without context (who, what, when, why)
- ❌ Assume logs are real-time (check timestamps)

## Related Subskills

- **dynatrace**: For distributed tracing across services
- **azure-insights**: For Azure-specific log queries (KQL)
- **kubernetes-logs**: For K8s-specific log patterns
- **klh-centralized-logging**: For enterprise log aggregation

---

**Remember**: Logs tell the story. Read them chronologically, look for patterns, and correlate across services.
