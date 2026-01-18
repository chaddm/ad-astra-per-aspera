# Dotfiles Management with rcm

## Overview

The `rcm` suite is a set of tools for managing dotfiles (configuration files that typically start with a dot, like `.bashrc`, `.vimrc`, etc.). It allows you to:

- Store dotfiles in a centralized directory (typically `~/.dotfiles`)
- Version control your dotfiles with git
- Share dotfiles across multiple machines
- Use host-specific configurations
- Use tag-based configurations for different contexts
- Manage symlinks automatically

## Core Concepts

### Dotfiles Directory

By default, rcm uses `~/.dotfiles` as the source directory for your configuration files. Files in this directory are symlinked to your home directory with a leading dot added.

**Example:**
- `~/.dotfiles/vimrc` → `~/.vimrc`
- `~/.dotfiles/zshrc` → `~/.zshrc`

### Symlinks vs Copies

- **Symlinks (default)**: Changes to files in your home directory automatically update the dotfiles directory
- **Copies**: Used for sensitive files (like SSH keys) that should not be symlinked

### Meta Directories

rcm supports special directories for organization:

1. **host-\*** directories: Host-specific configurations
   - Example: `~/.dotfiles/host-laptop/` for laptop-specific configs
   
2. **tag-\*** directories: Tag-based configurations
   - Example: `~/.dotfiles/tag-work/` for work-related configs
   
3. **hooks/** directory: Pre/post installation hooks
   - `hooks/pre-up`: Runs before installation
   - `hooks/post-up`: Runs after installation
   - `hooks/pre-down`: Runs before removal
   - `hooks/post-down`: Runs after removal

### Directory Handling

By default:
- **Files** are symlinked
- **Directories** have their structure replicated, with individual files symlinked inside

This means `~/.dotfiles/vim/colors/theme.vim` creates:
- `~/.vim/` (directory)
- `~/.vim/colors/` (directory)
- `~/.vim/colors/theme.vim` (symlink)

## The Four Programs

### 1. lsrc - List RC Files

**Purpose**: Show what would be installed/is installed

**Common Usage:**
```bash
# List all dotfiles
lsrc

# List with symbols showing status
lsrc -F
# Symbols: @ (symlink), $ (symlinked dir), X (copy)

# List for specific tag
lsrc -t work

# List from specific dotfiles directory
lsrc -d ~/work-dotfiles

# List specific files only
lsrc vimrc bashrc
```

**Key Options:**
- `-F`: Show status symbols
- `-v`: Verbose output
- `-t TAG`: Filter by tag
- `-d DIR`: Specify dotfiles directory
- `-B HOSTNAME`: Override hostname
- `-x PATTERN`: Exclude files matching pattern
- `-I PATTERN`: Include files despite exclusions

**Exclude Pattern Format:**
```bash
# Exclude specific file from all dotfiles dirs
lsrc -x bashrc

# Exclude from specific dotfiles directory
lsrc -x "work-dotfiles:*secret*"

# Exclude all emacs files
lsrc -x "*emacs*"
```

### 2. mkrc - Make RC File

**Purpose**: Add existing files to your dotfiles directory

**Common Usage:**
```bash
# Add a file to dotfiles
mkrc ~/.vimrc
# Result: moves ~/.vimrc to ~/.dotfiles/vimrc and creates symlink

# Add multiple files
mkrc ~/.zshrc ~/.gitconfig ~/.tigrc

# Add to specific tag
mkrc -t work ~/.ssh/config

# Add as host-specific
mkrc -o ~/.bashrc

# Add with custom hostname
mkrc -B laptop ~/.laptop-config

# Add to specific dotfiles directory
mkrc -d ~/company-dotfiles ~/.zshrc

# Copy instead of symlink
mkrc -C ~/.ssh/id_rsa

# Add directory as symlink (don't descend into it)
mkrc -S ~/.zprezto

# Add file/directory without leading dot
mkrc -U bin
# Result: ~/bin instead of ~/.bin
```

**Key Options:**
- `-o`: Host-specific (creates in host-* directory)
- `-B HOSTNAME`: Use specific hostname
- `-t TAG`: Add to tag directory
- `-d DIR`: Use specific dotfiles directory
- `-C`: Copy instead of symlink
- `-S`: Symlink entire directory (don't descend)
- `-U`: Install without leading dot
- `-K`: Skip hooks during installation
- `-v`: Verbose output

**Important Notes:**
- `mkrc` moves the file and creates a symlink back
- Always create the rc file first, then use mkrc on it
- Use `-C` for sensitive files like SSH keys

### 3. rcup - Update/Install RC Files

**Purpose**: Install or update symlinks from dotfiles directory to home directory

**Common Usage:**
```bash
# Install all dotfiles
rcup

# Verbose output (see what's happening)
rcup -v

# Very verbose (see even more detail)
rcup -vv

# Install specific tag
rcup -t work

# Install from multiple dotfiles directories (in order)
rcup -d ~/.dotfiles -d ~/work-dotfiles

# Force overwrite existing files
rcup -f

# Generate installation script (don't actually install)
rcup -g > install.sh

# Install specific files only
rcup vimrc zshrc

# Copy files instead of symlinking
rcup -C

# Exclude patterns
rcup -x "work-dotfiles:*secret*" -x "*~"
```

**Key Options:**
- `-v`: Verbose (can be repeated: `-vv`, `-vvv`)
- `-f`: Force overwrite if file exists and differs
- `-i`: Interactive mode (ask before overwriting) - DEFAULT
- `-t TAG`: Install with tag
- `-d DIR`: Use dotfiles directory (can be repeated)
- `-B HOSTNAME`: Override hostname
- `-C`: Copy instead of symlink
- `-S PATTERN`: Symlink entire directories matching pattern
- `-U PATTERN`: Install without leading dot
- `-x PATTERN`: Exclude files matching pattern
- `-I PATTERN`: Include despite exclusions
- `-K`: Skip hooks
- `-g`: Generate standalone script

**Installation Algorithm:**
1. Run pre-up hooks
2. Symlink non-host, non-tag files
3. Create directory structure and symlink files within
4. Apply host-specific files
5. Apply tag-specific files (in order specified)
6. Run post-up hooks

**Common Patterns:**
```bash
# Exclude install/build scripts from dotfiles
rcup -x install -x Makefile -x "*.sh"

# Install for multiple tags
rcup -t zsh -t git -t vim

# Use multiple dotfiles directories with exclusions
rcup -d ~/.dotfiles -d ~/work-dotfiles -x "work-dotfiles:personal*"
```

### 4. rcdn - Remove RC Files

**Purpose**: Remove symlinks/files managed by rcm

**Common Usage:**
```bash
# Remove all dotfiles
rcdn

# Verbose output
rcdn -v

# Remove specific tag
rcdn -t work

# Remove specific files only
rcdn zshrc vimrc

# Remove from specific dotfiles directory
rcdn -d ~/work-dotfiles

# Exclude patterns (don't remove matching files)
rcdn -x "*:vimrc"
```

**Key Options:**
- `-v`: Verbose output
- `-t TAG`: Remove tagged files
- `-d DIR`: Remove from specific dotfiles directory
- `-B HOSTNAME`: Override hostname
- `-x PATTERN`: Don't remove files matching pattern
- `-I PATTERN`: Remove despite exclusions
- `-S PATTERN`: Treat directories as symlinks when removing
- `-U PATTERN`: File was installed without leading dot
- `-K`: Skip hooks

**Important Notes:**
- Only removes symlinks by default
- Respects COPY_ALWAYS setting (will remove copied files listed there)
- If rc file is not a symlink but ancestor directory is, removes the directory
- Runs pre-down and post-down hooks

**Removal Algorithm:**
1. Run pre-down hooks
2. Remove symlinks in reverse order of installation
3. Remove copied files if listed in COPY_ALWAYS
4. Run post-down hooks

## Configuration File: ~/.rcrc

The `~/.rcrc` file configures rcm's behavior. It's written in POSIX shell syntax.

### Configuration Variables

```bash
# Default dotfiles directories (first is default for mkrc)
DOTFILES_DIRS="/home/user/.dotfiles /home/user/work-dotfiles"

# Default tags to always apply
TAGS="git vim zsh"

# Files to always copy (never symlink)
COPY_ALWAYS="ssh/id_* ssh/config netrc"

# Exclude patterns
EXCLUDES="*:README* *:LICENSE *:Makefile *:install.sh"

# Symlink entire directories (don't descend)
SYMLINK_DIRS="zprezto vim/bundle texmf"

# Files/directories to install without leading dot
UNDOTTED="bin texmf"

# Force specific hostname (useful for macOS)
HOSTNAME="my-laptop"
```

### Variable Details

**DOTFILES_DIRS**
- Space-separated list of dotfiles directories
- First directory is where `mkrc` installs new files
- Later directories can override earlier ones
- Tilde expansion is supported

**TAGS**
- Default tags applied during `rcup`
- Space-separated list
- Can be overridden with `-t` flag

**COPY_ALWAYS**
- Space-separated list of glob patterns
- Matching files are copied, not symlinked
- Use for sensitive files (SSH keys, credentials)
- Pattern: `*` copies everything

**EXCLUDES**
- Space-separated list of exclude patterns
- Format: `[dotfiles-dir:]pattern`
- Example: `work-dotfiles:personal*` excludes personal files from work directory
- Example: `README*` excludes all README files

**SYMLINK_DIRS**
- Space-separated list of patterns
- Matching directories are symlinked entirely
- Useful for package managers like zprezto
- Prevents descending into directory

**UNDOTTED**
- Space-separated list of patterns
- Matching files installed without leading dot
- Example: `bin` → `~/bin` instead of `~/.bin`
- Useful for directories that shouldn't be hidden

**HOSTNAME**
- Override computed hostname
- **Critical for macOS** (hostname can change via DHCP)
- Use consistent name across reboots

## Common Workflows

### Starting Fresh (No Existing Dotfiles Directory)

```bash
# 1. Create dotfiles directory
mkdir ~/.dotfiles

# 2. Add existing rc files
mkrc ~/.vimrc ~/.zshrc ~/.gitconfig

# 3. Verify what will be installed
lsrc -F

# 4. Install symlinks
rcup -v

# 5. Initialize git repository
cd ~/.dotfiles
git init
git add -A
git commit -m "Initial dotfiles commit"
```

### Migrating Existing Dotfiles Directory

```bash
# 1. Check what would be installed
lsrc

# 2. Look for unexpected files (install scripts, etc.)
lsrc | grep -E '(install|Makefile|README)'

# 3. Create exclusions in ~/.rcrc
cat > ~/.rcrc << 'EOF'
EXCLUDES="install* Makefile* README* LICENSE*"
EOF

# 4. Update symlinks
rcup -v
```

### Adding a New Dotfile

```bash
# 1. Create the rc file in your home directory
echo "set nocompatible" > ~/.vimrc

# 2. Add it to dotfiles
mkrc ~/.vimrc

# 3. Verify
lsrc -F vimrc

# The file is now:
# - Moved to ~/.dotfiles/vimrc
# - Symlinked back to ~/.vimrc
# - Ready to be committed to git
```

### Host-Specific Configuration

```bash
# 1. Add host-specific file
mkrc -o ~/.bashrc

# 2. Or with custom hostname
mkrc -B laptop ~/.laptop-config

# 3. Verify
lsrc -F

# Results in:
# ~/.dotfiles/host-$(hostname)/bashrc → ~/.bashrc
```

### Tag-Based Configuration

```bash
# 1. Add file to tag
mkrc -t work ~/.ssh/work_config

# 2. Install with tag
rcup -t work -v

# 3. Remove tag
rcdn -t work -v

# 4. List tag files
lsrc -t work
```

### Using Multiple Dotfiles Directories

```bash
# Setup in ~/.rcrc
DOTFILES_DIRS="$HOME/.dotfiles $HOME/work-dotfiles $HOME/shared-dotfiles"

# Install from all directories (order matters - first wins)
rcup -v

# Add to specific directory
mkrc -d ~/work-dotfiles ~/.work-specific-config

# Exclude patterns from specific directory
rcup -x "work-dotfiles:personal*"
```

### Syncing to a New Machine

```bash
# 1. Clone dotfiles repository
git clone https://github.com/user/dotfiles.git ~/.dotfiles

# 2. Preview what will be installed
lsrc -F

# 3. Install (use -i for interactive if concerned about overwrites)
rcup -v

# 4. Or force overwrite existing files
rcup -f -v

# 5. For fresh system with no conflicts
rcup -v
```

### Managing Sensitive Files

```bash
# 1. Configure in ~/.rcrc
cat >> ~/.rcrc << 'EOF'
COPY_ALWAYS="ssh/id_* ssh/config netrc gitconfig-personal"
EOF

# 2. Add the sensitive file
mkrc -C ~/.ssh/id_rsa

# 3. Verify it's copied, not symlinked
lsrc -F | grep ssh/id_rsa
# Should show "X" for copied

# Note: Changes to copied files in ~ don't update ~/.dotfiles
```

### Managing Directories

```bash
# Default behavior - descend into directory
mkrc ~/.vim
# Creates: ~/.vim/colors/theme.vim as symlink

# Symlink entire directory
mkrc -S ~/.zprezto
# Creates: ~/.zprezto as symlink to ~/.dotfiles/zprezto

# Configure in ~/.rcrc for persistence
echo 'SYMLINK_DIRS="zprezto vim/bundle"' >> ~/.rcrc
```

### Creating Standalone Installation Script

```bash
# Generate installation script
env RCRC=/dev/null rcup -B 0 -g > install.sh

# Make executable
chmod +x install.sh

# Use on new machine (no rcm needed)
./install.sh

# The script contains all the ln commands needed
```

### Removing Dotfiles

```bash
# Remove all dotfiles
rcdn -v

# Remove specific files
rcdn vimrc zshrc

# Remove by tag
rcdn -t work -v

# Keep certain files while removing others
rcdn -x vimrc -x zshrc -v
```

## Using Hooks

Hooks are executable scripts that run at specific points in the rcm workflow.

### Hook Types

- **pre-up**: Before `rcup` installs files
- **post-up**: After `rcup` installs files
- **pre-down**: Before `rcdn` removes files
- **post-down**: After `rcdn` removes files

### Creating Hooks

```bash
# Single file hook
cat > ~/.dotfiles/hooks/pre-up << 'EOF'
#!/bin/sh
echo "Installing dotfiles..."
EOF
chmod +x ~/.dotfiles/hooks/pre-up

# Directory of hooks (run in alphabetical order)
mkdir -p ~/.dotfiles/hooks/post-up
cat > ~/.dotfiles/hooks/post-up/01-install-vim-plugins << 'EOF'
#!/bin/sh
vim +PluginInstall +qall
EOF
chmod +x ~/.dotfiles/hooks/post-up/01-install-vim-plugins

cat > ~/.dotfiles/hooks/post-up/02-setup-zsh << 'EOF'
#!/bin/sh
if [ ! -d "$HOME/.zprezto" ]; then
    git clone --recursive https://github.com/sorin-ionescu/prezto.git ~/.zprezto
fi
EOF
chmod +x ~/.dotfiles/hooks/post-up/02-setup-zsh
```

### Hook Best Practices

- **Make idempotent**: Hooks run every time rcup/rcdn runs
- **Use numerical prefixes**: Control execution order (01-, 02-, etc.)
- **Make executable**: `chmod +x` is required
- **Error handling**: Check for prerequisites before running
- **Skip hooks**: Use `-K` flag if needed

### Common Hook Use Cases

```bash
# Install package manager plugins
hooks/post-up/10-vim-plugins

# Clone additional repositories
hooks/post-up/20-clone-repos

# Set up development environment
hooks/post-up/30-dev-setup

# Compile local tools
hooks/post-up/40-compile-tools

# Cleanup on removal
hooks/post-down/10-cleanup
```

## Patterns and Exclusions

### Pattern Format

Patterns use the format: `[dotfiles-dir:]glob-pattern`

```bash
# Match in all dotfiles directories
*:README*

# Match in specific directory only
work-dotfiles:personal*

# When directory omitted, matches in all
README*
```

### Common Exclusion Patterns

```bash
# In ~/.rcrc
EXCLUDES="
    README*
    LICENSE*
    Makefile*
    *.md
    install*
    .git
    .gitignore
    .gitmodules
    work-dotfiles:personal*
    *:*~
    *:.*.swp
"

# Or on command line
rcup -x README -x LICENSE -x install.sh -x Makefile
```

### Pattern Quoting

Shell globs need quoting:

```bash
# Quote to prevent shell expansion
rcup -x "*.md" -x "*~"
lsrc -x "*emacs*"

# Or use single quotes
rcup -x '*.md' -x '*~'
```

## Troubleshooting

### Files Not Being Installed

```bash
# Check if file is excluded
lsrc -F | grep filename

# Check with verbose output
rcup -vv

# Verify no exclusion patterns match
grep EXCLUDES ~/.rcrc
```

### Wrong Hostname on macOS

```bash
# macOS hostname can change (DHCP issue)
# Force hostname in ~/.rcrc
echo 'HOSTNAME="my-laptop"' >> ~/.rcrc

# Verify
lsrc -v
```

### Dotted Filenames in Dotfiles Directory

```bash
# rcm skips files starting with dot in dotfiles directory
# Rename them without the leading dot

# Find all dotted files
find ~/.dotfiles -name '.*' -type f

# Remove dotfiles before renaming
rcdn -v

# Rename (remove leading dot)
cd ~/.dotfiles
for file in .*; do
    mv "$file" "${file#.}"
done

# Reinstall
rcup -v
```

### Conflicts with Existing Files

```bash
# Interactive mode (default, prompts for each conflict)
rcup -i

# Force overwrite
rcup -f

# Preview what would happen
lsrc -F

# Remove existing files first
rm ~/.vimrc ~/.zshrc
rcup -v
```

### Symlink vs Copy Confusion

```bash
# Check file type
lsrc -F
# @ = symlink
# $ = symlinked directory
# X = copy

# Force copy instead of symlink
rcup -C

# Configure in ~/.rcrc
echo 'COPY_ALWAYS="ssh/* netrc"' >> ~/.rcrc
```

### Pre/Post Hooks Not Running

```bash
# Verify hooks are executable
ls -l ~/.dotfiles/hooks/
chmod +x ~/.dotfiles/hooks/post-up

# Run with hooks explicitly enabled
rcup -k -v

# Skip hooks for debugging
rcup -K -v
```

## Advanced Patterns

### Multiple Environments

```bash
# ~/.rcrc
DOTFILES_DIRS="$HOME/.dotfiles $HOME/.work-dotfiles"
TAGS="git vim"
EXCLUDES="work-dotfiles:personal* dotfiles:work*"

# Install
rcup -v
```

### Conditional Configuration

```bash
# Use tags for different contexts
mkrc -t laptop ~/.laptop-config
mkrc -t desktop ~/.desktop-config
mkrc -t work ~/.work-config

# Install on laptop
rcup -t laptop -t work -v

# Install on desktop
rcup -t desktop -v
```

### Shared Dotfiles with Overrides

```bash
# Directory priority (first wins)
DOTFILES_DIRS="$HOME/.dotfiles-personal $HOME/.dotfiles-shared"

# Personal overrides shared
# ~/.dotfiles-personal/vimrc beats ~/.dotfiles-shared/vimrc
```

### Version-Specific Dotfiles

```bash
# Use host-specific for version differences
mkrc -B ubuntu-20.04 ~/.bashrc
mkrc -B ubuntu-22.04 ~/.bashrc

# Or use tags
mkrc -t ubuntu-20.04 ~/.bashrc
mkrc -t ubuntu-22.04 ~/.bashrc
```

## Best Practices

1. **Use version control**: Always git commit your dotfiles
2. **Document in README**: Explain your setup, especially tags and structure
3. **Exclude non-dotfiles**: Use EXCLUDES for README, LICENSE, install scripts
4. **Set HOSTNAME on macOS**: Prevent hostname changes from breaking host-specific configs
5. **Test with lsrc**: Always preview with `lsrc -F` before running `rcup`
6. **Use tags thoughtfully**: Organize by role (work/personal) or tool (vim/emacs)
7. **Copy sensitive files**: Use COPY_ALWAYS for SSH keys, credentials
8. **Make hooks idempotent**: They run every time
9. **Use -v flag**: Verbose output helps debugging
10. **Keep it simple**: Start basic, add complexity as needed

## Quick Reference

```bash
# List what would be installed
lsrc -F

# Add file to dotfiles
mkrc ~/.vimrc

# Add host-specific file
mkrc -o ~/.bashrc

# Add tagged file
mkrc -t work ~/.work-config

# Install all dotfiles
rcup -v

# Install with tag
rcup -t work -v

# Remove all dotfiles
rcdn -v

# Remove tagged files
rcdn -t work -v

# Generate install script
rcup -g > install.sh

# Preview before installing
lsrc -F
```

## Integration with Git

```bash
# Initialize repository
cd ~/.dotfiles
git init
git add -A
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/user/dotfiles.git
git push -u origin main

# On new machine
git clone https://github.com/user/dotfiles.git ~/.dotfiles
rcup -v

# After making changes
cd ~/.dotfiles
git add -A
git commit -m "Update vimrc"
git push

# Update from remote
cd ~/.dotfiles
git pull
rcup -v
```

## Common .rcrc Examples

### Minimal

```bash
DOTFILES_DIRS="$HOME/.dotfiles"
TAGS="git vim"
EXCLUDES="README* LICENSE*"
```

### Standard

```bash
DOTFILES_DIRS="$HOME/.dotfiles"
TAGS="git vim zsh"
COPY_ALWAYS="ssh/id_* netrc"
EXCLUDES="README* LICENSE* Makefile* install* *.md"
SYMLINK_DIRS="vim/bundle zprezto"
HOSTNAME="my-laptop"
```

### Complex

```bash
DOTFILES_DIRS="$HOME/.dotfiles $HOME/.work-dotfiles $HOME/.shared-dotfiles"
TAGS="git vim zsh tmux"
COPY_ALWAYS="ssh/id_* ssh/config netrc gitconfig-personal"
EXCLUDES="
    README*
    LICENSE*
    Makefile*
    install*
    *.md
    .git
    .gitignore
    work-dotfiles:personal*
    shared-dotfiles:work*
    *:*.swp
    *:*~
"
SYMLINK_DIRS="vim/bundle vim/plugged zprezto oh-my-zsh texmf"
UNDOTTED="bin texmf"
HOSTNAME="macbook-pro"
```

## Resources

- Main documentation: http://thoughtbot.github.io/rcm/
- Tutorial: http://thoughtbot.github.io/rcm/rcm.7.html
- GitHub: https://github.com/thoughtbot/rcm
