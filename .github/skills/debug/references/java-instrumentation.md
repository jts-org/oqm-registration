# Java Instrumentation - JVM Debugging and Profiling

## When to Use

- Java application crashes or hangs
- Memory leaks or OutOfMemoryError
- High CPU usage or slow performance
- Thread deadlocks or contention
- Class loading issues

## Prerequisites

- Java application running with JVM access
- JDK tools available (jps, jstack, jmap, jstat, jcmd)
- Appropriate permissions to attach to JVM
- Understanding of JVM architecture basics

## Debugging Steps

### 1. Identify Java Process

```bash
# List Java processes
jps -l

# Get PID of specific application
jps -l | grep "MyApplication"

# Show JVM arguments
jps -v
```

### 2. Check JVM Status

```bash
# Get JVM overview
jcmd <pid> VM.uptime
jcmd <pid> VM.version
jcmd <pid> VM.system_properties

# Check JVM flags
jcmd <pid> VM.flags

# Get command line used to start JVM
jcmd <pid> VM.command_line
```

### 3. Thread Analysis

```bash
# Get thread dump
jstack <pid> > thread-dump.txt

# Get thread dump with locks
jstack -l <pid> > thread-dump-locks.txt

# Multiple dumps for pattern analysis
for i in {1..5}; do
  jstack <pid> > thread-dump-$i.txt
  sleep 5
done
```

**Analyze Thread Dump**:
- Look for BLOCKED threads
- Check for deadlocks (jstack reports them)
- Identify threads waiting on locks
- Check thread states (RUNNABLE, WAITING, TIMED_WAITING)

### 4. Memory Analysis

```bash
# Get heap summary
jmap -heap <pid>

# Get histogram of object counts
jmap -histo <pid> | head -30

# Get histogram of live objects only
jmap -histo:live <pid> | head -30

# Create heap dump
jmap -dump:live,format=b,file=heap-dump.hprof <pid>

# Memory usage statistics
jstat -gcutil <pid> 1000 10  # 10 samples, 1 second apart
```

**Analyze Memory**:
- Check heap usage vs max heap
- Look for growing object counts (potential leak)
- Check GC frequency and duration
- Identify large object allocations

### 5. Garbage Collection Analysis

```bash
# GC statistics
jstat -gc <pid> 1000

# GC summary
jstat -gcutil <pid> 1000 10

# Get detailed GC log (if -Xlog:gc* enabled)
# Check application logs for GC events
```

**Key Metrics**:
- FGC: Full GC count
- FGCT: Full GC time
- GCT: Total GC time
- Check if GC time is >1% of uptime

### 6. Class Loading Issues

```bash
# Show loaded classes
jcmd <pid> VM.class_hierarchy

# Show classloader statistics
jcmd <pid> VM.classloader_stats

# Check for class not found
# Look in application logs for ClassNotFoundException
```

## Tools

### JDK Command-Line Tools

**jps**: List Java processes
```bash
jps -l -m -v
```

**jstack**: Thread dumps
```bash
jstack -l <pid>  # Include locks
jstack -F <pid>  # Force dump if hung
```

**jmap**: Memory dumps and histograms
```bash
jmap -heap <pid>
jmap -histo:live <pid>
jmap -dump:format=b,file=dump.hprof <pid>
```

**jstat**: JVM statistics
```bash
jstat -gcutil <pid> 1000  # GC stats every second
jstat -class <pid>        # Class loading stats
jstat -compiler <pid>     # JIT compiler stats
```

**jcmd**: JVM command interface
```bash
jcmd <pid> help           # List available commands
jcmd <pid> Thread.print   # Thread dump
jcmd <pid> GC.heap_info   # Heap information
jcmd <pid> GC.class_histogram  # Class histogram
```

### JVM Arguments for Debugging

**Enable GC Logging**:
```bash
# Java 11+
-Xlog:gc*:file=gc.log:time,level,tags

# Java 8
-XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log
```

**Enable Remote Debugging**:
```bash
-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
```

**Heap Dump on OOM**:
```bash
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/path/to/dumps
```

**Enable JMX**:
```bash
-Dcom.sun.management.jmxremote
-Dcom.sun.management.jmxremote.port=9999
-Dcom.sun.management.jmxremote.authenticate=false
-Dcom.sun.management.jmxremote.ssl=false
```

### Analysis Tools

**Eclipse MAT**: Memory Analyzer Tool
- Analyze heap dumps
- Find memory leaks
- Identify large objects

**VisualVM**: JVM monitoring
- Real-time monitoring
- CPU and memory profiling
- Thread analysis

**JProfiler / YourKit**: Commercial profilers
- Advanced profiling
- CPU, memory, thread analysis
- SQL and HTTP profiling

## Common Issues

### Issue: OutOfMemoryError
**Symptoms**: Application crashes with OOM
**Diagnosis**:
```bash
# Check heap dump (created with -XX:+HeapDumpOnOutOfMemoryError)
# Analyze with Eclipse MAT or jhat

# Check what's using memory
jmap -histo:live <pid> | head -20
```
**Solutions**:
- Increase heap size: `-Xmx4g`
- Fix memory leak (found in heap dump)
- Reduce cached data
- Implement proper object lifecycle

### Issue: High CPU Usage
**Symptoms**: Java process consuming 100% CPU
**Diagnosis**:
```bash
# Get thread dump
jstack <pid> > thread-dump.txt

# Identify high-CPU threads
top -H -p <pid>  # Linux
# Note the thread IDs (TID)

# Find thread in dump
# Convert TID to hex: printf '%x\n' <TID>
# Search for "nid=0x<hex>" in thread dump
```
**Solutions**:
- Fix infinite loop in hot thread
- Reduce GC overhead (tune GC)
- Optimize algorithm causing high CPU

### Issue: Application Hangs
**Symptoms**: Application not responding
**Diagnosis**:
```bash
# Get thread dump
jstack -l <pid> > thread-dump.txt

# Look for:
# - "Found one Java-level deadlock"
# - Many BLOCKED threads
# - Threads waiting on same lock
```
**Solutions**:
- Fix deadlock (reorder lock acquisition)
- Reduce lock contention
- Use concurrent data structures

### Issue: Memory Leak
**Symptoms**: Memory usage grows over time
**Diagnosis**:
```bash
# Take heap dumps over time
jmap -dump:live,format=b,file=heap1.hprof <pid>
# Wait 30 minutes
jmap -dump:live,format=b,file=heap2.hprof <pid>

# Compare dumps in MAT
# Look for growing object counts
```
**Solutions**:
- Fix object retention (close resources)
- Remove static references
- Clear caches properly
- Fix listener registration leaks

### Issue: Slow Startup
**Symptoms**: Application takes long to start
**Diagnosis**:
```bash
# Check class loading
jcmd <pid> VM.classloader_stats

# Enable class loading logging
-Xlog:class+load=info
```
**Solutions**:
- Reduce classpath scanning
- Optimize dependency injection
- Use lazy initialization

## Examples

### Example 1: Diagnose Deadlock
```bash
# Get thread dump
jstack -l 12345 > deadlock.txt

# jstack will report:
# "Found one Java-level deadlock:"
# Showing which threads are waiting on which locks

# Fix: Reorder lock acquisition in code
```

### Example 2: Find Memory Leak
```bash
# Take baseline heap dump
jmap -dump:live,format=b,file=heap-start.hprof 12345

# Exercise application (run for a while)
# Take another heap dump
jmap -dump:live,format=b,file=heap-after.hprof 12345

# Analyze with Eclipse MAT
# Look for objects growing between dumps
# Check dominator tree for large retainers
```

### Example 3: Identify High-CPU Thread
```bash
# Find Java process
PID=$(jps -l | grep MyApp | awk '{print $1}')

# Find high-CPU thread
top -H -p $PID
# Note TID of high-CPU thread (e.g., 12367)

# Convert to hex
HEXID=$(printf '%x\n' 12367)  # Output: 304f

# Get thread dump and find thread
jstack $PID | grep -A 20 "nid=0x$HEXID"
# Shows what the thread is doing
```

### Example 4: Analyze GC Overhead
```bash
# Monitor GC
jstat -gcutil 12345 1000

# Check for:
# - High FGC count (full GCs)
# - High FGCT (full GC time)
# - Low OU after full GC (indicates leak)

# Solution: Tune GC or fix memory issue
```

## Integration with Debug Process

### For Memory Issues
1. Get heap histogram: `jmap -histo:live <pid>`
2. Identify suspect objects
3. Take heap dump: `jmap -dump`
4. Analyze in MAT
5. Fix code retaining objects

### For Performance Issues
1. Check CPU usage: `top -H -p <pid>`
2. Get thread dump: `jstack <pid>`
3. Identify hot threads
4. Review code in hot paths
5. Optimize or parallelize

### For Hangs/Deadlocks
1. Get thread dump: `jstack -l <pid>`
2. Check for deadlock report
3. Analyze BLOCKED threads
4. Review locking order in code
5. Fix synchronization

## Best Practices

### Do:
- ✅ Enable GC logging in production
- ✅ Set -XX:+HeapDumpOnOutOfMemoryError
- ✅ Take multiple thread dumps (pattern analysis)
- ✅ Use jcmd for live process inspection
- ✅ Analyze heap dumps offline (not on prod)
- ✅ Monitor GC time (should be <1% of uptime)

### Don't:
- ❌ Take heap dumps in production without review (can pause app)
- ❌ Use -Xdebug in production (security risk)
- ❌ Ignore GC logs (early warning of issues)
- ❌ Set -Xmx too high (can increase GC pause times)
- ❌ Profile in production without testing impact
- ❌ Forget to remove debug flags after use

## Spring Boot Specific

### Actuator Endpoints
```bash
# Thread dump
curl http://localhost:8080/actuator/threaddump

# Heap dump
curl http://localhost:8080/actuator/heapdump -o heap.hprof

# Metrics
curl http://localhost:8080/actuator/metrics/jvm.memory.used
```

### Enable Actuator
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,threaddump,heapdump
```

## Related Subskills

- **logs-access**: Check application logs for exceptions
- **dynatrace**: APM monitoring and distributed tracing
- **azure-insights**: Azure-specific JVM monitoring
- **kubernetes-logs**: Container logs for containerized Java apps

---

**Remember**: JVM diagnostics are powerful. Use jcmd for non-invasive inspection, thread dumps for hangs, heap dumps for memory leaks. Always test diagnostic commands on non-production first.
