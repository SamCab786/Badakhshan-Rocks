/**
 * Unit Tests: Full Report Synchronicity & Candidate Binding
 * Verifies that buildCandidateReport binds all fields to the chosen candidate
 * and never leaks stale fields or selections across scans.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCandidateReport } from '../src/utils/reportBinding';
import { ScanResult, IdentificationCandidate } from '../src/types/geology';
import { GEOLOGY_CATALOG } from '../src/data/geologyCatalog';

const mockCandidateLapis: IdentificationCandidate = {
  name_en: 'Badakhshan Lapis Lazuli',
  name_fa: 'لاجورد بدخشان (لاپی لزولی)',
  rank: 1,
  reasoning_fa: 'مشاهده رنگ آبی سیر همراه با دانه‌های برنجی فلزی و رگه‌های کلسیت سفید.',
  resolution: 'species',
  category: 'gemstone',
  key_visual_indicators_fa: ['رنگ آبی تیره لاجوردی', 'دانه‌های برنجی پیریت'],
  visual_conflicts_fa: ['عدم رؤیت مقطع هگزاگونال بلوری'],
  recommended_tests_fa: ['بررسی ناخالصی پیریت زیر لوپ ۱۰X'],
  reference_status: 'matched_local_catalog'
};

const mockCandidateEmerald: IdentificationCandidate = {
  name_en: 'Panjshir Emerald',
  name_fa: 'زمرد پنجشیر',
  rank: 2,
  reasoning_fa: 'رنگ سبز شاخص کروم‌دار با شکستگی‌های مشخص بریل.',
  resolution: 'species',
  category: 'gemstone',
  key_visual_indicators_fa: ['سبز شفاف زمرّدی', 'بلورهای منشوری'],
  visual_conflicts_fa: ['رنگ آبی لاجوردی ندارد'],
  recommended_tests_fa: ['فیلتر چلسی برای بررسی واکنش کروم'],
  reference_status: 'matched_local_catalog'
};

const mockScanA: ScanResult = {
  scanId: 'scan-alpha-101',
  timestamp: 1700000000000,
  imageSrc: 'data:image/jpeg;base64,...',
  candidates: [mockCandidateLapis, mockCandidateEmerald],
  detected_features: {
    colorTones: 'آبی سیر (#1e3a8a)',
    grainSizeTexture: 'ناهمگن دانه‌ای',
    crystalHabit: 'توده‌ای نامنظم',
    luster: 'مات تا شیشه‌ای',
    veinsMatrix: 'رگه‌های سفید کلسیت',
    layeringFoliation: 'توزیع نامنظم دانه‌ها',
    translucency: 'کدر',
    limitations: 'سختی و وزن مخصوص از عکس اندازه‌گیری نشده است.'
  },
  engine_used: 'Gemini 3.8 Flash Vision',
  review_status: 'reviewed',
  image_quality: 'usable',
  specimen_scope: 'multi_phase_appearance'
};

test('buildCandidateReport binds candidate 0 correctly', () => {
  const report = buildCandidateReport(mockScanA, 0);

  assert.equal(report.scanId, 'scan-alpha-101');
  assert.equal(report.candidateIndex, 0);
  assert.equal(report.hypothesis.nameFa, 'لاجورد بدخشان (لاپی لزولی)');
  assert.equal(report.hypothesis.nameEn, 'Badakhshan Lapis Lazuli');
  assert.match(report.referenceSpecs.formula, /سنگ مرکب|سودالیت/);
  assert.match(report.referenceSpecs.localityNotesFa, /سرسنگ/);
  assert.match(report.referenceSpecs.mohs, /۵|5/);
  assert.ok(report.fieldTests.length > 0);
});

test('switching candidate index to 1 completely changes ALL reference fields', () => {
  const report0 = buildCandidateReport(mockScanA, 0);
  const report1 = buildCandidateReport(mockScanA, 1);

  // Both belong to the same scan
  assert.equal(report0.scanId, report1.scanId);

  // But the names, formulas, hardness, crystal system, and locality must be completely different
  assert.notEqual(report0.hypothesis.nameFa, report1.hypothesis.nameFa);
  assert.equal(report1.hypothesis.nameFa, 'زمرد پنجشیر');
  assert.equal(report1.hypothesis.nameEn, 'Panjshir Emerald');

  assert.notEqual(report0.referenceSpecs.formula, report1.referenceSpecs.formula);
  assert.match(report1.referenceSpecs.formula, /Be₃Al₂/);

  assert.notEqual(report0.referenceSpecs.mohs, report1.referenceSpecs.mohs);
  assert.match(report1.referenceSpecs.mohs, /۷|7\.5/);

  assert.notEqual(report0.referenceSpecs.crystalSystem, report1.referenceSpecs.crystalSystem);
  assert.match(report1.referenceSpecs.crystalSystem, /هگزاگونال/);

  assert.notEqual(report0.referenceSpecs.localityNotesFa, report1.referenceSpecs.localityNotesFa);
  assert.match(report1.referenceSpecs.localityNotesFa, /پنجشیر/);

  // Visual observations from the unchanged photo remain intact
  assert.equal(report0.visualObservations.colorTones, report1.visualObservations.colorTones);
});

test('buildCandidateReport safely clamps out-of-bounds candidate index', () => {
  const reportHigh = buildCandidateReport(mockScanA, 99);
  assert.equal(reportHigh.candidateIndex, 1);
  assert.equal(reportHigh.hypothesis.nameEn, 'Panjshir Emerald');

  const reportNegative = buildCandidateReport(mockScanA, -5);
  assert.equal(reportNegative.candidateIndex, 0);
  assert.equal(reportNegative.hypothesis.nameEn, 'Badakhshan Lapis Lazuli');
});

test('buildCandidateReport properly handles a new scan ID preventing bleeding', () => {
  const mockScanB: ScanResult = {
    ...mockScanA,
    scanId: 'scan-beta-202',
    candidates: [mockCandidateEmerald]
  };

  const reportB = buildCandidateReport(mockScanB, 0);
  assert.equal(reportB.scanId, 'scan-beta-202');
  assert.notEqual(reportB.scanId, mockScanA.scanId);
  assert.equal(reportB.hypothesis.nameEn, 'Panjshir Emerald');
});

test('all 51 catalog specimens have valid chemical formula, hardness and locality', () => {
  assert.equal(GEOLOGY_CATALOG.length, 51);
  for (const specimen of GEOLOGY_CATALOG) {
    assert.ok(specimen.name_fa && specimen.name_fa.length > 2, `Specimen ${specimen.id} missing name_fa`);
    assert.ok(specimen.name_en && specimen.name_en.length > 2, `Specimen ${specimen.id} missing name_en`);
    assert.ok(specimen.formula && specimen.formula.length > 0, `Specimen ${specimen.id} missing formula`);
    assert.ok(specimen.mohs_display && specimen.mohs_display.length > 0, `Specimen ${specimen.id} missing mohs`);
    assert.ok(specimen.badakhshan_afghanistan_notes_fa && specimen.badakhshan_afghanistan_notes_fa.length > 0, `Specimen ${specimen.id} missing locality`);
  }
});
