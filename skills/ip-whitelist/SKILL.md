---
name: ip-whitelist
description:
  Manage IP whitelist for Provider Nexus API clients using TypeScript scripts
  that make curl calls to the admin API endpoints.
license: MIT
compatibility: opencode
metadata:
---

# IP Whitelist Skill

## What I Do

This skill manages the IP whitelist for Provider Nexus API clients using `curl`
calls.

### Configuration

**Environment**

All script files require the `--env=<environment>` parameter to specify the target
environment. The list of environments is found in
`skill/ip_whitelist/environments.csv`. If you are requested to use this skill and the
environment is not specified, read the file and provide the following response:

```
To use the IP Whitelist Skill, please specify the environment:
    1. Local       | `http://localhost:5001`             |
    2. Staging     | `https://staging.providernexus.com` |
    <remaining list>

Which environment would you like to use?
```

If the response is an name or number, map it to the corresponding
environment.

**Clients**

Some scripts require the `--client-id=<client_id>` parameter. Clients are listed in
`skill/ip_whitelist/clients.csv`. If a client is required for the action and is not
provided, ask the user to provide it. If the user provides a client name, map it to
the corresponding client ID or ask for clarification and provide options if there are
multiple matches.

> Note: Special Client IDs
> Client Strenuus (12) is used for administrative accounts in all environments.
> Client HealthStart (292) is used for developers in Staging and Sandbox.
> Always use Localhost for testing.

**IP Addresses**

Some scripts require the `--ip-address=<ip_or_cidr>` parameter.

### Available Actions

All scripts return the HTTP status code on the first line followed by the response
body. Example:

```
HTTP Status: 200
[
  {
    "clientId": "client123",
    "ips": [
      { "ip": "192.168.1.10", "userId": "userA", "netmask": "255.255.255.0" },
      { "ip": "10.0.0.5" }
    ]
  }
]
```

#### 1. List All Whitelisted Client IPs

Returns all whitelisted IPs for all clients.

```bash
skill/ip_whitelist/list-for-all-clients --env=<environment>
```

**Response Example:**

```
HTTP Status: 200
[
  {
    "clientId": "client123",
    "ips": [
      { "ip": "192.168.1.10", "userId": "userA", "netmask": "255.255.255.0" },
      { "ip": "10.0.0.5" }
    ]
  }
]
```

#### 2. Show Whitelisted IPs for a Specific Client

Returns all whitelisted IPs for the specified client.

```bash
skill/ip_whitelist/show-for-client.ts --env=<environment> --client-id=<client_id>
```

**Response Example:**

```
HTTP Status: 200
{
  "clientId": "client123",
  "ips": [
    { "ip": "192.168.1.10", "userId": "userA", "netmask": "255.255.255.0" },
    { "ip": "10.0.0.5" }
  ]
}
```

#### 3. Add Whitelisted IP (Simple)

Adds the specified IP to the client's whitelist.

```bash
skill/ip_whitelist/add-ip.ts --env=<environment> --client-id=<client_id> --ip=<ip_address>
```

**Response Example:**

```
HTTP Status: 200
{
  "success": true,
  "message": "IP added to whitelist",
  "clientId": "client123",
  "ip": "10.0.0.5"
}
```

#### 4. Add Whitelisted IP for a Specific User

Adds the specified IP to the client's whitelist, associated with a user.

```bash
skill/ip_whitelist/add-ip.ts --env=<environment> --client-id=<client_id> --ip=<ip_address> --user-id=<user_id>
```

**Response Example:**

```
HTTP Status: 200
{
  "success": true,
  "message": "IP added for user",
  "clientId": "client123",
  "ip": "10.0.0.5",
  "userId": "userA"
}
```

#### 5. Add Whitelisted IP with Netmask and User

Adds the specified IP and netmask to the client's whitelist, associated with a user.

```bash
skill/ip_whitelist/add-ip.ts --env=<environment> --client-id=<client_id> --ip=<ip_address> --user-id=<user_id> --netmask=<netmask>
```

**Note:** For CIDR notation, use the CIDR suffix (e.g., `24`) as the netmask parameter.

**Response Example:**

```
HTTP Status: 200
{
  "success": true,
  "message": "IP and netmask added for user",
  "clientId": "client123",
  "ip": "192.168.1.10",
  "netmask": "255.255.255.0",
  "userId": "userA"
}
```

#### 6. Remove Whitelisted IP

Removes the specified IP from the client's whitelist.

```bash
skill/ip_whitelist/remove-ip.ts --env=<environment> --client-id=<client_id> --ip=<ip_address>
```

**Response Example:**

```
HTTP Status: 200
{
  "success": true,
  "message": "IP removed from whitelist",
  "clientId": "client123",
  "ip": "10.0.0.5"
}
```

#### 7. Find Clients by Name Pattern

Searches for clients matching a regular expression pattern (case-insensitive).

```bash
skill/ip_whitelist/find-clients.ts --regexp="<pattern>"
```

**Parameters:**

- `--regexp` - Regular expression pattern to match against client names (case-insensitive)

**Response Example (matches found):**

```
"id","name"
31,"UnitedHealthcare (UHC)"
53,"Health Net"
103,"HealthPartners of MN"
Matching rows: 3
```

**Response Example (no matches):**

```
"id","name"
Matching rows: 0
```

**Usage Examples:**

Find clients with "health" in their name:

```bash
skill/ip_whitelist/find-clients.ts --regexp="health"
```

Find clients starting with "Blue":

```bash
skill/ip_whitelist/find-clients.ts --regexp="^Blue"
```

Find clients with "BCBS" or "BlueCross":

```bash
skill/ip_whitelist/find-clients.ts --regexp="BCBS|BlueCross"
```

### Common Errors

#### Incapsula 503 Error (Staging Environment)

If you receive an HTTP 503 error with an Incapsula incident ID when accessing the staging environment, this indicates that **staging is currently offline and not being routed**. The Incapsula WAF blocks requests when the backend service is unavailable.

**Error Response Example:**

```
HTTP Status: 503
<html>...Incapsula incident ID: 202000480358381066-859142232585407505...</html>
```

**Resolution:** Try a different environment or wait for staging to come back online.

## When to Use Me

Use this skill when you need work with whitelist addresses.
