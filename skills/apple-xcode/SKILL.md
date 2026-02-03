# Apple XCode Skill

## Description

This skill provides assistance with Apple XCode, the integrated development
environment (IDE) for macOS used to develop software for macOS, iOS, watchOS, and
tvOS.

## Command Line Tools

**Verify XCode Command Line Tools Installation:**

```bash
xcode-select --install
```

Will return information on the installation if not already installed; otherwise, you
will receive a message indicating the installation directory.

**Set XCode Command Line Tools Path:**

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

**Check XCode Version:**

```bash
xcodebuild -version
```

**Accept XCode License:**

Important: XCode license acceptance cannot be executed by agent. You must return
instructions to the user to run this command manually.

```bash
sudo xcodebuild -license accept
```
