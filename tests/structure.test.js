/**
 * Smoke tests – verify that the top-level project structure is intact.
 * These run in the root Jest context (not inside any app workspace).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

describe('Repository structure', () => {
  const requiredPaths = [
    '.github/workflows/ci.yml',
    '.github/workflows/cd.yml',
    '.github/workflows/lint.yml',
    'apps/web/package.json',
    'apps/api/package.json',
    'packages/ui/package.json',
    'packages/config/package.json',
    'packages/utils/package.json',
    'infrastructure/docker/Dockerfile.web',
    'infrastructure/docker/Dockerfile.api',
    'infrastructure/scripts/bootstrap.sh',
    'infrastructure/terraform/main.tf',
    'docker-compose.yml',
    '.env.example',
    '.gitignore',
    'turbo.json',
    'README.md',
  ];

  requiredPaths.forEach(p => {
    it(`${p} exists`, () => {
      expect(exists(p)).toBe(true);
    });
  });
});
