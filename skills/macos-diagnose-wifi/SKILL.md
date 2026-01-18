---
name: macos-diagnose-wifi
description: Diagnose WiFi connectivity issues on macOS by analyzing system state, logs, and metrics autonomously
license: MIT
compatibility: opencode
metadata:
  platform: macOS
  category: diagnostics
---

## What I do

I perform a comprehensive, autonomous WiFi diagnosis on macOS systems. When invoked, I:

- Collect current WiFi status, interface information, and system metrics
- Test connectivity across all QoS (Quality of Service) classes
- Analyze signal quality, noise levels, and channel conditions
- Examine system logs for hardware errors (chip traps, firmware crashes)
- Identify root causes using pattern recognition and domain expertise
- Produce a detailed diagnostic report with prioritized solutions

**No parameters required** - I gather everything automatically from the running system.

## When to use me

Use me when experiencing:

- WiFi connectivity problems or inability to connect
- Packet loss or intermittent disconnections
- Slow speeds despite good signal strength
- Connection works on other devices but not on your Mac
- Need to troubleshoot before contacting support
- Want to understand what's causing WiFi issues

## How I work

I execute a multi-phase diagnostic procedure:

### Phase 1: System Information Collection

**Objective:** Identify hardware and software environment

Commands to run:
```bash
sw_vers
system_profiler SPHardwareDataType SPSoftwareDataType
ifconfig -a
```

Identify WiFi interface (typically `en0` on most Macs)

**What to extract:**
- macOS version (e.g., "15.1", "14.5")
- Build number (e.g., "25B78")
- Mac model (e.g., "MacBookPro18,3")
- WiFi interface name
- MAC address of WiFi interface

### Phase 2: WiFi Status & Metrics Analysis

**Objective:** Get current connection state and signal quality

Commands to run:
```bash
# Current WiFi information
/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I

# Scan available networks
/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s

# Connection status
networksetup -getairportnetwork en0

# Interface details
ifconfig en0
```

**Critical metrics to extract:**
- **SSID**: Network name
- **BSSID**: Access point MAC address
- **RSSI**: Signal strength in dBm (e.g., -45 dBm)
- **Noise**: Background noise in dBm (e.g., -92 dBm)
- **Channel**: WiFi channel and width (e.g., "149/80" means channel 149, 80 MHz wide)
- **PHY Mode**: WiFi standard (11a/11b/11g/11n/11ac/11ax)
- **Tx Rate**: Transmission rate in Mbps
- **MCS Index**: Modulation and Coding Scheme index
- **NSS**: Number of spatial streams
- **Security**: Security type (WPA2, WPA3, etc.)
- **Link quality**: Overall link quality score
- **State**: Connection state (active, inactive)

**Calculate SNR (Signal-to-Noise Ratio):**
SNR = RSSI - Noise
Example: -45 dBm - (-92 dBm) = 47 dB

### Phase 3: Network Connectivity Testing

**Objective:** Test actual data flow and identify which traffic classes work

Get router IP:
```bash
# Find default gateway (router)
netstat -nr | grep default | grep en0 | awk '{print $2}' | head -1
```

**Localhost test:**
```bash
ping -c 3 127.0.0.1
```

**Router ping tests with QoS classes:**

Test each QoS (WMM) class separately:

```bash
# BE - Best Effort (normal traffic)
ping -c 5 -b en0 -k BE -t 2 -W 2000 <router_ip>

# BK - Background (bulk transfers)
ping -c 5 -b en0 -k BK -t 2 -W 2000 <router_ip>

# VI - Video (streaming)
ping -c 5 -b en0 -k VI -t 2 -W 2000 <router_ip>

# VO - Voice (real-time communications)
ping -c 5 -b en0 -k VO -t 2 -W 2000 <router_ip>
```

**Parse results:**
- Count packets transmitted vs received
- Calculate packet loss percentage
- Note average latency (round-trip time)
- **Critical pattern**: If only VO works but others fail → WMM queue corruption

**DNS test:**
```bash
# Test DNS resolution
ping -c 3 -t 2 www.apple.com

# Check DNS servers
scutil --dns | grep 'nameserver\[0\]'
```

**Internet connectivity test:**
```bash
# Test external connectivity
ping -c 3 8.8.8.8
```

### Phase 4: System Log Analysis

**Objective:** Find hardware errors, firmware crashes, and driver issues

**WiFi subsystem logs:**
```bash
# Recent WiFi errors (last hour)
log show --predicate 'subsystem == "com.apple.wifi"' --last 1h --style compact
```

Look for specific error patterns:
- "chip trap"
- "firmware crash"
- "BCMWLAN"
- "watchdog"
- "association failed"
- "deauth"
- "disassoc"
- "auth timeout"

**Kernel WiFi errors:**
```bash
# Kernel errors related to WiFi
log show --predicate 'process == "kernel" AND messageType == error' --last 1h | grep -i -E '(wifi|802\.11|airport|broadcom|bcm)'
```

### Phase 5: Advanced Network Diagnostics

```bash
# ARP table
arp -a

# Routing table
netstat -rn

# DNS configuration
scutil --dns

# AWDL status (can cause interference)
ifconfig awdl0

# Check for USB 3.0 interference
system_profiler SPUSBDataType | grep -A 5 "USB 3"
```

## Domain Knowledge

### WiFi Metrics Interpretation

#### RSSI (Received Signal Strength Indicator)
Measured in dBm (decibel-milliwatts). Higher (less negative) is better.

| RSSI Range       | Quality   | Description                          |
|------------------|-----------|--------------------------------------|
| -30 to -50 dBm   | Excellent | Maximum performance, close to AP     |
| -51 to -67 dBm   | Good      | Reliable connection, normal range    |
| -68 to -80 dBm   | Fair      | May experience reduced speeds        |
| Below -80 dBm    | Poor      | Unreliable, frequent disconnections  |

**Critical threshold:** -67 dBm is the minimum for reliable high-speed connections.

#### Noise Floor
Background radio interference measured in dBm. Lower (more negative) is better.

| Noise Range      | Quality   | Description                          |
|------------------|-----------|--------------------------------------|
| Below -95 dBm    | Excellent | Minimal interference                 |
| -90 to -95 dBm   | Good      | Normal environment                   |
| -85 to -90 dBm   | Fair      | Some interference present            |
| -80 to -85 dBm   | Poor      | Significant interference             |
| Above -80 dBm    | Critical  | Severe interference, unstable        |

**Sources of noise:** Microwave ovens, Bluetooth devices, USB 3.0, other WiFi networks, cordless phones.

#### SNR (Signal-to-Noise Ratio)
Calculated as: **SNR = RSSI - Noise**

Example: RSSI -45 dBm, Noise -92 dBm → SNR = -45 - (-92) = 47 dB

| SNR Range    | Quality   | Expected Performance                 |
|--------------|-----------|--------------------------------------|
| Above 40 dB  | Excellent | Maximum throughput, no loss          |
| 25-40 dB     | Good      | High throughput, minimal loss        |
| 15-25 dB     | Fair      | Reduced throughput, some loss        |
| 10-15 dB     | Poor      | Very slow, high packet loss          |
| Below 10 dB  | Critical  | Unusable, frequent disconnections    |

**Minimum for reliable data:** 20 dB SNR for normal web browsing.

#### Channel Utilization (CCA - Clear Channel Assessment)
Percentage of time the channel is busy.

| CCA Range    | Congestion | Impact                               |
|--------------|------------|--------------------------------------|
| 0-30%        | Low        | Optimal performance                  |
| 30-50%       | Moderate   | Good performance, minor delays       |
| 50-80%       | High       | Reduced speeds, increased latency    |
| Above 80%    | Severe     | Very slow, frequent retries          |

### PHY Modes (WiFi Standards)

| Standard    | Name        | Max Speed   | Frequency   | Notes                |
|-------------|-------------|-------------|-------------|----------------------|
| 802.11ax    | WiFi 6/6E   | 9.6 Gbps    | 2.4/5/6 GHz | Latest, best         |
| 802.11ac    | WiFi 5      | 6.9 Gbps    | 5 GHz       | Common, fast         |
| 802.11n     | WiFi 4      | 600 Mbps    | 2.4/5 GHz   | Older, acceptable    |
| 802.11a/g   | WiFi 2/3    | 54 Mbps     | 2.4/5 GHz   | Legacy, slow         |
| 802.11b     | WiFi 1      | 11 Mbps     | 2.4 GHz     | Ancient, avoid       |

**Best practices:**
- Use 5 GHz when possible (less interference, more channels)
- 802.11ac or newer for modern devices
- Avoid 2.4 GHz in crowded environments

### QoS Classes (WMM - WiFi Multimedia)

WiFi uses 4 priority queues for different traffic types:

| Class | Name          | Priority | Typical Use                    |
|-------|---------------|----------|--------------------------------|
| VO    | Voice         | Highest  | VoIP, video calls (latency-sensitive) |
| VI    | Video         | High     | Streaming video, conferencing  |
| BE    | Best Effort   | Normal   | Web browsing, file downloads   |
| BK    | Background    | Low      | System updates, backups        |

**Normal behavior:** Most traffic uses BE (Best Effort).

**Critical diagnostic pattern:**
- If **only VO works** but BE/BK/VI fail → WMM queue corruption (driver crash)
- If **all QoS classes fail equally** → Signal or router issue
- If **packet loss increases from VO → VI → BE → BK** → Normal congestion

### Channel Selection

#### 2.4 GHz Channels
- **Non-overlapping channels:** 1, 6, 11 (US)
- **Pros:** Better range, penetrates walls
- **Cons:** Crowded, slow, interferes with Bluetooth

#### 5 GHz Channels
- **UNII-1 (36-48):** Most compatible, no DFS
- **UNII-2/2e (52-144):** DFS channels, may auto-switch
- **UNII-3 (149-165):** Most compatible, no DFS, best choice

**DFS (Dynamic Frequency Selection):** Channels 52-144 must avoid radar. If radar detected, channel switches, causing brief disconnection.

**Recommendations:**
- 5 GHz channels 36, 40, 44, 48, 149, 153, 157, 161 (non-DFS)
- Use 80 MHz or 40 MHz width for speed
- Avoid channels with high utilization (check scan)

### Common Issue Patterns

#### Pattern 1: Chip Trap / Firmware Crash

**Symptoms:**
- Logs show "BCMWLAN Chip Trap", "watchdog", "firmware crash"
- Excellent RSSI (e.g., -22 dBm) but 100% packet loss
- Connection shows as "active" but no data flows
- Only VO QoS class works (sometimes)

**Root Cause:**
- Broadcom WiFi chipset firmware encountered a fatal error
- Driver may partially recover but leave queues corrupted
- Occurs on Intel Macs with Broadcom WiFi chips

**Solution Priority:**
1. **Restart Mac** (reloads firmware and driver)
2. **Reset SMC** (System Management Controller)
3. **Reset NVRAM/PRAM:** Shutdown → Restart → Hold Option+Command+P+R for 20 seconds
4. **Update macOS** (may include WiFi driver fixes)
5. If persistent → Hardware issue, contact Apple Support

#### Pattern 2: Selective QoS Failure (WMM Queue Corruption)

**Symptoms:**
- Only VO (Voice) traffic succeeds
- BE (Best Effort) has 100% or high packet loss
- BK, VI also fail or partial failure
- Good RSSI and signal quality

**Root Cause:**
- WMM (WiFi Multimedia) queue handling failure
- Often follows a firmware crash or driver bug
- Router WMM misconfiguration or incompatibility

**Solution Priority:**
1. **Restart Mac** (resets queue state)
2. **Check router WMM settings:** Ensure WMM is **enabled** for 5 GHz
3. **Update router firmware**
4. **Try different channel** (especially non-DFS)
5. **Test with another router** (isolate cause)

#### Pattern 3: Poor Signal Strength

**Symptoms:**
- RSSI below -70 dBm
- Packet loss proportional to signal quality
- Works when closer to router
- Tx Rate fluctuates or stays low

**Root Cause:**
- Physical distance from access point
- Obstacles (walls, metal, water)
- Interference from environment

**Solution Priority:**
1. **Move closer to router**
2. **Remove obstacles** between Mac and router
3. **Change router position** (higher, central location)
4. **Use 5 GHz** (better than 2.4 GHz for close range)
5. **Add WiFi extender or mesh system**

#### Pattern 4: Interference

**Symptoms:**
- High noise floor (above -85 dBm)
- Low SNR (below 20 dB)
- Packet loss even with good RSSI
- Performance varies by time/location

**Root Cause:**
- Other WiFi networks on same/overlapping channels
- Microwave ovens (2.4 GHz)
- Bluetooth devices
- USB 3.0 devices near WiFi antenna
- Cordless phones

**Solution Priority:**
1. **Change WiFi channel** to less congested one
2. **Use 5 GHz instead of 2.4 GHz**
3. **Move away from interference sources**
4. **Disable AWDL** if not using AirDrop/Handoff: `sudo ifconfig awdl0 down`
5. **Disconnect USB 3.0 devices** temporarily (test)

#### Pattern 5: Channel Congestion

**Symptoms:**
- Good signal (RSSI > -60)
- High CCA (> 50%)
- Slow speeds despite good Tx Rate capability
- Many networks on same channel (from scan)

**Root Cause:**
- Too many WiFi networks competing for same channel
- Common in apartments, offices, dense areas

**Solution Priority:**
1. **Run WiFi scan** to see channel usage
2. **Switch to least used channel**
3. **Use 5 GHz** (more channels available)
4. **Use 40 MHz width** instead of 80 MHz (more flexibility)
5. **Upgrade to WiFi 6** (better congestion handling)

#### Pattern 6: Router Configuration Issues

**Symptoms:**
- Mac fails but other devices work fine
- Authentication or association failures in logs
- Connection drops randomly
- Specific to one network/router

**Root Cause:**
- WMM disabled on router (Apple devices require it)
- Incompatible router firmware
- Security mode incompatibility
- Router overload or hardware issue

**Solution Priority:**
1. **Enable WMM/QoS on router**
2. **Update router firmware**
3. **Change security mode** (try WPA2/WPA3 transition)
4. **Disable band steering** (if enabled)
5. **Separate 2.4 & 5 GHz SSIDs**
6. **Restart router**
7. **Factory reset router** (last resort)
8. **Test with different router** (isolate issue)

#### Pattern 7: DNS Resolution Problems

**Symptoms:**
- Can ping IP addresses (e.g., 8.8.8.8)
- Cannot resolve domain names (e.g., www.apple.com)
- Browsers show "DNS_PROBE_FINISHED_NXDOMAIN"
- Works on other networks

**Root Cause:**
- DNS server unreachable or slow
- Router DNS relay broken
- DNS cache corrupted

**Solution Priority:**
1. **Change DNS servers:** Add 8.8.8.8, 8.8.4.4 (Google) or 1.1.1.1 (Cloudflare)
2. **Flush DNS cache:** `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
3. **Restart Mac**
4. **Check router DNS settings**

### macOS-Specific WiFi Issues

#### AWDL (Apple Wireless Direct Link) Interference

**What it is:** Peer-to-peer WiFi protocol used by AirDrop, Handoff, Sidecar.

**Issue:** Can interfere with regular WiFi, especially on 2.4 GHz.

**Check:** `ifconfig awdl0`

**Disable temporarily:** `sudo ifconfig awdl0 down`

**Re-enable:** `sudo ifconfig awdl0 up`

#### Bluetooth Coexistence

**Issue:** Bluetooth and 2.4 GHz WiFi share the same frequency band, can interfere.

**Solutions:**
- Use 5 GHz WiFi (Bluetooth doesn't affect it)
- Disable Bluetooth temporarily (test)
- Update macOS (improved coexistence algorithms)

#### Broadcom Driver Issues

**Common on:** Intel MacBook Pro/Air with Broadcom WiFi chips.

**Known bugs:**
- Firmware crashes after sleep/wake
- WMM queue corruption
- Memory leaks causing degradation over time

**Solutions:**
- Keep macOS updated (driver fixes)
- Restart regularly
- Reset SMC/NVRAM

**Apple Silicon note:** M1/M2/M3 Macs don't use Broadcom chips, less prone to these issues.

## Diagnostic Decision Tree

```
START
│
├─ Are logs showing "chip trap" or "firmware crash"?
│  YES → Firmware Crash → Restart Mac, reset SMC/NVRAM
│  NO → Continue
│
├─ Is RSSI good (> -67 dBm) AND packet loss 100%?
│  YES → Driver/Firmware Issue → Check QoS pattern
│  │     ├─ Only VO works? → WMM Queue Corruption
│  │     └─ All QoS fail? → Firmware Crash
│  NO → Continue
│
├─ Is RSSI poor (< -70 dBm)?
│  YES → Signal Strength Issue → Move closer, remove obstacles
│  NO → Continue
│
├─ Is Noise high (> -85 dBm) OR SNR low (< 20 dB)?
│  YES → Interference → Change channel, move away from sources
│  NO → Continue
│
├─ Is CCA high (> 50%) OR many networks on same channel?
│  YES → Channel Congestion → Switch to less crowded channel
│  NO → Continue
│
├─ Does WiFi work on other networks?
│  NO → Mac-specific issue → Run Apple Diagnostics
│  YES → Router issue → Check WMM settings, update firmware
│
├─ Do other devices work on this network?
│  NO → Router problem → Restart router, update firmware
│  YES → Mac + Router compatibility → Check WMM, security, channel
│
└─ Can ping IP but not domain names?
   YES → DNS issue → Change DNS servers, flush cache
```

## Solution Priority Matrix

### Immediate Actions (Do These First)

1. **Restart Mac** - Fixes: Firmware crashes, driver issues, WMM corruption
2. **Restart Router** - Fixes: Router overload, temporary bugs
3. **Forget and Rejoin Network** - Fixes: Corrupted network settings

### Quick Fixes (High Success Rate)

4. **Reset SMC/NVRAM** - Fixes: Hardware communication issues
5. **Enable WMM on Router** - Fixes: QoS issues, Apple device incompatibility
6. **Change WiFi Channel** - Best channels: 36, 40, 149, 153, 157, 161
7. **Update macOS** - Fixes: Driver bugs, security issues
8. **Update Router Firmware** - Fixes: Router bugs, compatibility

### Advanced Solutions

9. **Delete Network Preferences** - Location: `/Library/Preferences/SystemConfiguration/`
10. **Change DNS Servers** - To Google: 8.8.8.8, 8.8.4.4
11. **Disable AWDL Temporarily** - `sudo ifconfig awdl0 down`
12. **Change Security Mode** - Try: WPA2/WPA3 Transition mode
13. **Separate 2.4/5 GHz Bands** - Give each band different SSID
14. **Create New User Account (Test)** - Tests user-specific issues
15. **Run Apple Diagnostics** - Restart → Hold D during boot

### Hardware/Last Resort

16. **Safe Mode Boot** - Restart → Hold Shift
17. **Contact Apple Support** - For persistent issues
18. **Contact Router Manufacturer** - For compatibility issues

## Report Output Format

Structure the diagnostic report as follows:

### Executive Summary
- Brief description of the problem
- Root cause(s) identified
- Severity assessment
- Top 3 recommended actions

### System Information
- macOS version and build
- Mac model
- WiFi chipset information
- Current network interface status

### WiFi Status & Metrics
- Connection state (connected/disconnected)
- SSID and BSSID
- RSSI, Noise, SNR (with quality assessment)
- Channel and width
- PHY mode and Tx Rate
- Security type
- Link quality score

### Connectivity Test Results
- Localhost ping results
- Router ping results (overall)
- QoS-specific ping results (BE, BK, VI, VO)
- DNS resolution test
- External connectivity test
- Packet loss percentages per test

### QoS Performance Analysis
- Which QoS classes work/fail
- Pattern identification (e.g., only VO works)
- WMM status assessment

### Log Analysis
- Recent WiFi errors found
- Chip trap or firmware crash events
- Association/authentication failures
- Other relevant error patterns

### Channel & Interference Analysis
- Current channel and utilization
- Nearby networks and their channels
- Recommended channels
- Interference sources detected

### Root Cause Assessment
- Primary issue identified
- Secondary contributing factors
- Confidence level in diagnosis

### Recommended Solutions
- Immediate actions (prioritized list)
- Quick fixes to try
- Advanced troubleshooting steps
- When to seek professional help

### Technical Details
- Full command outputs
- Detailed metrics table
- Complete log excerpts
- Additional diagnostic data

## Important Notes

- Run all commands with appropriate error handling
- Some commands may require sudo (request user permission if needed)
- Parse command outputs carefully for key information
- If a command fails, note it and continue with alternative data sources
- Provide clear, actionable recommendations based on findings
- Always prioritize solutions by likelihood of success and ease of implementation

## macOS Version Compatibility

This skill works on:
- macOS 10.15 (Catalina) and later
- Intel and Apple Silicon Macs
- Some commands may vary slightly between versions

If a command is not available, adapt using alternative approaches.
