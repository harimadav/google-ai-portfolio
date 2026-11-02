import test from 'node:test';
import assert from 'node:assert/strict';
import {
  slugify,
  validateProjectInput,
  validateCertificationInput,
  validateFileUpload,
  groupSkillsByCategory,
  PortfolioCache,
  INITIAL_PORTFOLIO_SEED,
} from './portfolioLogic.ts';

test('slugify converts titles into clean URL slugs', () => {
  assert.equal(slugify('Water Level Predicting System'), 'water-level-predicting-system');
  assert.equal(slugify('  Learning Management System (LMS)! '), 'learning-management-system-lms');
});

test('validateProjectInput accepts valid project and rejects missing fields or invalid URLs', () => {
  const validProject = INITIAL_PORTFOLIO_SEED.projects[0];
  const resValid = validateProjectInput(validProject);
  assert.equal(resValid.valid, true);
  assert.deepEqual(resValid.errors, {});

  const invalidRes = validateProjectInput({
    title: 'Hi',
    shortDescription: 'Too short',
    problemGoal: '',
    solution: '',
    githubUrl: 'not-a-url',
    liveUrl: 'ftp://bad-url',
  });
  assert.equal(invalidRes.valid, false);
  assert.ok(invalidRes.errors.title);
  assert.ok(invalidRes.errors.shortDescription);
  assert.ok(invalidRes.errors.githubUrl);
  assert.ok(invalidRes.errors.liveUrl);
});

test('validateCertificationInput validates required fields', () => {
  const cert = INITIAL_PORTFOLIO_SEED.certifications[0];
  assert.equal(validateCertificationInput(cert).valid, true);

  const badCert = validateCertificationInput({
    title: '',
    issuer: '',
    description: 'abc',
    completionDate: '',
    fileStoragePath: '',
  });
  assert.equal(badCert.valid, false);
  assert.ok(badCert.errors.title);
  assert.ok(badCert.errors.fileStoragePath);
});

test('validateFileUpload enforces MIME type and size boundaries', () => {
  const okPdf = validateFileUpload({
    fileName: 'resume.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1024 * 120,
    dataBase64: 'JVBERi0xLjQKMSAwIG9iago=',
  });
  assert.equal(okPdf.valid, true);

  const badExe = validateFileUpload({
    fileName: 'script.exe',
    mimeType: 'application/x-msdownload',
    sizeBytes: 20 * 1024 * 1024,
    dataBase64: 'ABCD',
  });
  assert.equal(badExe.valid, false);
  assert.ok(badExe.errors.mimeType);
  assert.ok(badExe.errors.sizeBytes);
});

test('groupSkillsByCategory filters unpublished items and sorts by displayOrder', () => {
  const grouped = groupSkillsByCategory([
    { category: 'Backend', name: 'Node', published: true, displayOrder: 2 },
    { category: 'Backend', name: 'Postgres', published: true, displayOrder: 1 },
    { category: 'Backend', name: 'Hidden', published: false, displayOrder: 0 },
  ]);
  assert.equal(grouped['Backend'].length, 2);
  assert.equal(grouped['Backend'][0].name, 'Postgres');
  assert.equal(grouped['Backend'][1].name, 'Node');
});

test('PortfolioCache stores, retrieves, and invalidates affected routes deterministically', () => {
  const cache = new PortfolioCache(60_000);
  cache.set('public_portfolio', { ok: true });
  cache.set('project_water-level-predicting-system', { title: 'Water Level' });
  assert.deepEqual(cache.get('public_portfolio'), { ok: true });

  const v1 = cache.getVersion();
  const inv = cache.invalidate(['project_water-level-predicting-system']);
  assert.equal(inv.version, v1 + 1);
  assert.equal(cache.get('public_portfolio'), null);
  assert.equal(cache.get('project_water-level-predicting-system'), null);
});
