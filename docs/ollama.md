# Ollama Usage Guide

## Introduction

Ollama is a powerful tool for running large language models locally on your machine.
It provides a simple command-line interface to download, manage, and interact with
various AI models including Llama 2, Code Llama, Mistral, and many others. With
Ollama, you can:

- Run AI models completely offline
- Customize and create your own model variants
- Integrate models into applications via REST API
- Manage multiple models efficiently
- Fine-tune model behavior with custom configurations

## Quick Start

### 1. Start the Server
```bash
ollama serve
```

### 2. Pull a Model
```bash
ollama pull llama2
```

### 3. Run the Model
```bash
ollama run llama2
```

## Core Commands

### Server Management

#### `ollama serve`
Starts the Ollama server daemon.

**Usage:**
```bash
ollama serve [flags]
```

**Key Environment Variables:**
- `OLLAMA_HOST`: Server bind address (default: 127.0.0.1:11434)
- `OLLAMA_ORIGINS`: Allowed origins for CORS
- `OLLAMA_MODELS`: Directory to store models
- `OLLAMA_KEEP_ALIVE`: Model keep-alive duration
- `OLLAMA_MAX_LOADED_MODELS`: Maximum number of loaded models

**Example:**
```bash
# Start server on all interfaces
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# Start with custom model directory
OLLAMA_MODELS=/custom/path ollama serve
```

### Model Management

#### `ollama pull`
Downloads a model from the registry.

**Usage:**
```bash
ollama pull <model>[:tag]
```

**Examples:**
```bash
# Pull latest version
ollama pull llama2

# Pull specific version
ollama pull llama2:13b

# Pull from specific registry
ollama pull registry.example.com/my-model
```

#### `ollama list`
Lists all locally available models.

**Usage:**
```bash
ollama list [flags]
```

**Example output:**
```
NAME            ID              SIZE    MODIFIED
llama2:latest   sha256:abc123   3.8 GB  2 hours ago
codellama:7b    sha256:def456   3.8 GB  1 day ago
```

#### `ollama show`
Displays detailed information about a model.

**Usage:**
```bash
ollama show <model>[:tag]
```

**Examples:**
```bash
ollama show llama2
ollama show llama2:13b
```

#### `ollama rm`
Removes a model from local storage.

**Usage:**
```bash
ollama rm <model>[:tag]
```

**Examples:**
```bash
ollama rm llama2:7b
ollama rm codellama
```

#### `ollama cp`
Copies a model to create a new variant.

**Usage:**
```bash
ollama cp <source> <destination>
```

**Example:**
```bash
ollama cp llama2:7b my-custom-llama
```

#### `ollama create`
Creates a new model from a Modelfile.

**Usage:**
```bash
ollama create <model-name> -f <Modelfile>
```

**Example:**
```bash
ollama create my-model -f ./Modelfile
```

#### `ollama push`
Uploads a model to a registry.

**Usage:**
```bash
ollama push <model>[:tag]
```

**Examples:**
```bash
ollama push my-model
ollama push my-model:latest
```

### Running Models

#### `ollama run`
Runs a model interactively or with a single prompt.

**Usage:**
```bash
ollama run <model>[:tag] [prompt]
```

**Flags:**
- `--verbose, -v`: Show timings for response
- `--insecure`: Use insecure connection to registry
- `--nowordwrap`: Don't wrap words to terminal width
- `--format`: Response format (e.g., json)

**Examples:**
```bash
# Interactive mode
ollama run llama2

# Single prompt
ollama run llama2 "Explain quantum computing"

# JSON output format
ollama run llama2 --format json "What is AI?"

# Verbose output with timings
ollama run llama2 -v "Hello world"
```

#### `ollama ps`
Lists currently running models and their resource usage.

**Usage:**
```bash
ollama ps
```

**Example output:**
```
NAME            ID              SIZE    PROCESSOR    UNTIL
llama2:latest   sha256:abc123   5.9 GB  100% GPU     4m from now
```

### Authentication

#### `ollama signin`
Authenticates with the Ollama registry.

**Usage:**
```bash
ollama signin [registry-url]
```

**Example:**
```bash
ollama signin
ollama signin registry.example.com
```

#### `ollama signout`
Signs out from the Ollama registry.

**Usage:**
```bash
ollama signout [registry-url]
```

## Configuration

### Environment Variables

| Variable                   | Description                 | Default                                                                                            |
| -------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| `OLLAMA_HOST`              | Server bind address         | `127.0.0.1:11434`                                                                                  |
| `OLLAMA_ORIGINS`           | Allowed CORS origins        | `[http://localhost:*,http://127.0.0.1:*,https://localhost:*,https://127.0.0.1:*,http://0.0.0.0:*]` |
| `OLLAMA_MODELS`            | Model storage directory     | Platform-specific default                                                                          |
| `OLLAMA_KEEP_ALIVE`        | Model memory retention      | `5m`                                                                                               |
| `OLLAMA_MAX_LOADED_MODELS` | Maximum concurrent models   | `1`                                                                                                |
| `OLLAMA_NUM_PARALLEL`      | Parallel request processing | `1`                                                                                                |
| `OLLAMA_DEBUG`             | Enable debug logging        | `false`                                                                                            |
| `OLLAMA_FLASH_ATTENTION`   | Enable flash attention      | `false`                                                                                            |
| `OLLAMA_LLM_LIBRARY`       | LLM library path            | Auto-detected                                                                                      |
| `OLLAMA_TMPDIR`            | Temporary directory         | System default                                                                                     |

### Modelfile Configuration

Create custom model variants using Modelfiles:

```dockerfile
FROM llama2:7b

# Set temperature
PARAMETER temperature 0.8

# Set system message
SYSTEM "You are a helpful coding assistant."

# Set custom prompt template
TEMPLATE """{{ if .System }}{{ .System }}{{ end }}{{ if .Prompt }}### Human: {{ .Prompt }}{{ end }}### Assistant: """
```

## Examples

### Basic Model Usage

#### Download and Run Llama 2
```bash
# Download the model
ollama pull llama2:7b

# Run interactively
ollama run llama2:7b

# Single question
ollama run llama2:7b "What is machine learning?"
```

#### Code Generation with Code Llama
```bash
# Pull Code Llama
ollama pull codellama:7b

# Generate code
ollama run codellama:7b "Write a Python function to calculate fibonacci numbers"
```

### Custom Model Creation

#### Create a Specialized Assistant
```bash
# Create Modelfile
cat > Modelfile << EOF
FROM llama2:7b
SYSTEM "You are a Python expert who provides concise, working code examples."
PARAMETER temperature 0.7
EOF

# Create the model
ollama create python-expert -f Modelfile

# Use the custom model
ollama run python-expert "How do I read a CSV file?"
```

### Server Configuration

#### Production Server Setup
```bash
# Set environment variables
export OLLAMA_HOST=0.0.0.0:11434
export OLLAMA_ORIGINS="*"
export OLLAMA_MAX_LOADED_MODELS=3
export OLLAMA_KEEP_ALIVE=30m

# Start server
ollama serve
```

### API Integration

#### Using REST API
```bash
# Generate completion
curl http://localhost:11434/api/generate -d '{
  "model": "llama2",
  "prompt": "Why is the sky blue?",
  "stream": false
}'

# Chat completion
curl http://localhost:11434/api/chat -d '{
  "model": "llama2",
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    }
  ],
  "stream": false
}'
```

## Advanced Usage

### Performance Optimization

#### GPU Configuration
```bash
# Enable GPU acceleration (automatically detected)
ollama run llama2

# Check GPU usage
ollama ps
```

#### Memory Management
```bash
# Adjust model keep-alive time
OLLAMA_KEEP_ALIVE=10m ollama serve

# Load multiple models
OLLAMA_MAX_LOADED_MODELS=3 ollama serve
```

### Model Quantization

#### Creating Quantized Models
```dockerfile
FROM llama2:7b
PARAMETER quantization q4_0
```

### Batch Processing

#### Process Multiple Prompts
```bash
# Create input file
cat > prompts.txt << EOF
Explain photosynthesis
What is gravity?
How do computers work?
EOF

# Process each line
while IFS= read -r prompt; do
    echo "Processing: $prompt"
    ollama run llama2:7b "$prompt" >> results.txt
    echo "---" >> results.txt
done < prompts.txt
```

### Custom Templates

#### Advanced Prompt Templates
```dockerfile
FROM llama2:7b
TEMPLATE """{{- if .System }}{{ .System }}
{{- end }}{{- if .Prompt }}### Instruction:
{{ .Prompt }}

### Response:
{{- end }}"""
```

## Troubleshooting

### Common Issues

#### Server Won't Start
**Problem:** Ollama serve fails to start
**Solutions:**
```bash
# Check if port is in use
lsof -i :11434

# Try different port
OLLAMA_HOST=127.0.0.1:11435 ollama serve

# Check permissions
sudo ollama serve
```

#### Model Download Fails
**Problem:** `ollama pull` hangs or fails
**Solutions:**
```bash
# Check network connection
ping ollama.ai

# Use verbose mode
ollama pull llama2 -v

# Clear cache and retry
rm -rf ~/.ollama/models/manifests
ollama pull llama2
```

#### Out of Memory Errors
**Problem:** System runs out of memory when loading large models
**Solutions:**
```bash
# Use smaller model variant
ollama pull llama2:7b  # instead of llama2:13b

# Adjust keep-alive time
OLLAMA_KEEP_ALIVE=1m ollama serve

# Limit concurrent models
OLLAMA_MAX_LOADED_MODELS=1 ollama serve
```

#### Slow Response Times
**Problem:** Model responses are very slow
**Solutions:**
```bash
# Check system resources
ollama ps
htop

# Enable GPU acceleration (if available)
# Ensure CUDA/Metal drivers are installed

# Use quantized models
ollama pull llama2:7b-q4_0
```

### Debugging

#### Enable Debug Logging
```bash
OLLAMA_DEBUG=1 ollama serve
```

#### Check Model Information
```bash
# View model details
ollama show llama2

# List all models with sizes
ollama list
```

#### Verify API Connectivity
```bash
# Test API endpoint
curl http://localhost:11434/api/tags

# Check server health
curl http://localhost:11434/
```

### Performance Monitoring

#### Resource Usage
```bash
# Monitor running models
watch ollama ps

# System resource usage
htop
nvidia-smi  # For NVIDIA GPUs
```

### Recovery Procedures

#### Reset Ollama Installation
```bash
# Stop server
pkill ollama

# Clear models (WARNING: This removes all downloaded models)
rm -rf ~/.ollama

# Restart
ollama serve &
ollama pull llama2
```

#### Corrupted Model Recovery
```bash
# Remove specific model
ollama rm problematic-model

# Re-download
ollama pull problematic-model
```

---

For more information and updates,visit the
[official Ollama documentation](https://github.com/jmorganca/ollama) and
[community forum](https://github.com/jmorganca/ollama/discussions).