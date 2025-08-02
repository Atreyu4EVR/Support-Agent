#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const packageJsonPath = path.join(__dirname, "..", "package.json");

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  return packageJson.version;
}

function updateVersion(type = "patch") {
  try {
    const currentVersion = getCurrentVersion();
    console.log(`Current version: ${currentVersion}`);

    // Update version using npm version
    const newVersion = execSync(`npm version ${type} --no-git-tag-version`, {
      encoding: "utf8",
      cwd: path.join(__dirname, ".."),
    }).trim();

    console.log(`Updated to version: ${newVersion}`);

    // Create git tag
    execSync(`git add package.json`, { cwd: path.join(__dirname, "..") });
    execSync(`git commit -m "Bump version to ${newVersion}"`, {
      cwd: path.join(__dirname, ".."),
    });
    execSync(`git tag ${newVersion}`, { cwd: path.join(__dirname, "..") });

    console.log(`✅ Version bumped to ${newVersion} and tagged`);
    console.log(
      `📝 To push: git push origin main && git push origin ${newVersion}`
    );

    return newVersion;
  } catch (error) {
    console.error("❌ Error updating version:", error.message);
    process.exit(1);
  }
}

function createRelease(version, description = "") {
  try {
    const releaseNotes = description || `Release ${version}`;

    // Create GitHub release (requires GitHub CLI)
    execSync(
      `gh release create ${version} --title "Release ${version}" --notes "${releaseNotes}"`,
      {
        cwd: path.join(__dirname, ".."),
        stdio: "inherit",
      }
    );

    console.log(`✅ GitHub release created for ${version}`);
  } catch (error) {
    console.error("❌ Error creating GitHub release:", error.message);
    console.log("💡 Make sure GitHub CLI is installed and authenticated");
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "patch":
  case "minor":
  case "major":
    const newVersion = updateVersion(command);
    break;

  case "release":
    const version = args[1] || getCurrentVersion();
    const description = args[2] || "";
    createRelease(version, description);
    break;

  case "current":
    console.log(`Current version: ${getCurrentVersion()}`);
    break;

  default:
    console.log(`
BSC Support Agent - Version Management

Usage:
  node scripts/version.js <command> [options]

Commands:
  patch         Bump patch version (1.0.0 -> 1.0.1)
  minor         Bump minor version (1.0.0 -> 1.1.0)
  major         Bump major version (1.0.0 -> 2.0.0)
  release       Create GitHub release for current/specified version
  current       Show current version

Examples:
  node scripts/version.js patch
  node scripts/version.js release
  node scripts/version.js release v1.2.0 "Bug fixes and improvements"
`);
    break;
}
