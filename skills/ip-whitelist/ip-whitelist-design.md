# IP Whitelist Skill

## What I Do

This skill manages the IP whitelist for Provider Nexus API clients using `curl`
calls.

### Configuration

In order to be able to compose the correct `curl` commands, you need to have the
appropriate API key and the base URL for the environment. If you are requested
to use this skill and the environment is not specified, provide the following
response:

```
To use the IP Whitelist Skill, please specify the environment:
    1. Local       | `http://localhost:5001`             |
    2. Staging     | `https://staging.providernexus.com` |
    3. Upgrade     | `https://upgrade.providernexus.com` |
    4. Production  | `https://providernexus.com`         |
    5. Sandbox     | `https://sandbox.providernexus.com` |

Which environment would you like to use?
```

If the response is an name or number, map it to the corresponding
environment.

**Environment**

Here is the list of current environments and their corresponding base URLs:

| Environment | Base URL                            |
| ----------- | ----------------------------------- |
| Staging     | `https://staging.providernexus.com` |
| Upgrade     | `https://upgrade.providernexus.com` |
| Production  | `https://providernexus.com`         |
| Sandbox     | `https://sandbox.providernexus.com` |
| Local       | `http://localhost:5001`             |

**x-api-key Header**

API keys are associated with specific environments. Keys are available in
`~/.pnapass`. This is a `:` delimited file with the following format:
`<environment>:<api_key>`. Read the file and extract the appropriate API key
based on the selected environment.

**Clients**

Some actions require a client ID. Clients are listed in
`skill/ip_whitelist/clients.csv`. If a client is required for the action and is not
provided, ask the user to provide it. If the user provides a client name, map it to
the corresponding client ID or ask for clarification and provide options if there are
multiple matches.

**IP Addresses**

When adding or removing addresses, the end points accept a single IP address or a
CIDR block:

- IP address - `<base_url>/api/admin/clientIps/<client_id>/ip/1.2.3.4`
- CIDR block - `<base_url>/api/admin/clientIps/<client_id>/ip/1.2.3.4/24`

### Routes

#### 1. List All Whitelisted Client IPs

Returns a list of all clients and their associated whitelisted IPs.

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  -H "x-api-key: <api_key>" \
  "<base_url>/api/admin/clientIps"
```

**Response Example:**

```json
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
curl -X GET \
  -H "Content-Type: application/json" \
  -H "x-api-key: <api_key>" \
  "<base_url>/api/admin/clientIps/<client_id>"
```

**Response Example:**

```json
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
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "x-api-key: <api_key>" \
  "<base_url>/api/admin/clientIps/<client_id>/ip/<ip_address>"
```

**Example:**

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "x-api-key: abc123xyz" \
  "https://staging.providernexus.com/api/admin/clientIps/client123/ip/10.0.0.5"
```

#### 4. Add Whitelisted IP for a Specific User

Adds the specified IP to the client's whitelist, associated with a user.

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "x-api-key: <api_key>" \
  "<base_url>/api/admin/clientIps/<client_id>/ip/<ip_address>/userId/<user_id>"
```

**Example:**

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "x-api-key: abc123xyz" \
  "https://staging.providernexus.com/api/admin/clientIps/client123/ip/10.0.0.5/userId/userA"
```

#### 5. Add Whitelisted IP with Netmask and User

Adds the specified IP and netmask to the client's whitelist, associated with a user.

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "x-api-key: <api_key>" \
  "<base_url>/api/admin/clientIps/<client_id>/ip/<ip_address>/<netmask>/userId/<user_id>"
```

**Example:**

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "x-api-key: abc123xyz" \
  "https://staging.providernexus.com/api/admin/clientIps/client123/ip/192.168.1.10/255.255.255.0/userId/userA"
```

**Note:** For CIDR notation, use the CIDR suffix (e.g., `/24`) as the netmask parameter:

```bash
"<base_url>/api/admin/clientIps/<client_id>/ip/192.168.1.0/24/userId/userA"
```

#### 6. Remove Whitelisted IP

Removes the specified IP from the client's whitelist.

```bash
curl -X DELETE \
  -H "Content-Type: application/json" \
  -H "x-api-key: <api_key>" \
  "<base_url>/api/admin/clientIps/<client_id>/ip/<ip_address>"
```

**Example:**

```bash
curl -X DELETE \
  -H "Content-Type: application/json" \
  -H "x-api-key: abc123xyz" \
  "https://staging.providernexus.com/api/admin/clientIps/client123/ip/10.0.0.5"
```

### Response Format

All routes return JSON responses with appropriate HTTP status codes:

- **200 OK**: Successful operation
- **400 Bad Request**: Invalid parameters or malformed request
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient privileges
- **404 Not Found**: Client or IP not found
- **500 Internal Server Error**: Unexpected server error

**Success Response Example:**

```json
{
  "success": true,
  "message": "IP added to whitelist",
  "clientId": "client123",
  "ip": "10.0.0.5"
}
```

**Error Response Example:**

```json
{
  "success": false,
  "error": "Invalid IP address format"
}
```

## When to Use Me

Use this skill when you need work with whitelist addresses.
