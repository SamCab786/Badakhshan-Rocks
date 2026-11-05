/**
 * Unit Tests: Mineralogical Diagnostic & Spectral Matcher
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { matchSpecimensByMineralogy } from '../src/utils/mineralMatcher';

test('blue specimen with golden flecks matches Lapis Lazuli as #1', () => {
  const candidates = matchSpecimensByMineralogy({
    avgR: 35,
    avgG: 70,
    avgB: 200,
    brightnessPercent: 38,
    hasGoldSpecks: true,
    hasVeining: true,
    stdDev: 25,
    hexColor: '#2346c8'
  });

  assert.ok(candidates.length >= 3);
  assert.equal(candidates[0].mineral?.id, 'lapis-lazuli');
  assert.equal(candidates[0].name_fa, 'لاجورد بدخشان (لاپی لزولی)');
});

test('emerald green specimen matches Emerald or Malachite, never Lapis', () => {
  const candidates = matchSpecimensByMineralogy({
    avgR: 20,
    avgG: 170,
    avgB: 85,
    brightnessPercent: 45,
    hasGoldSpecks: false,
    hasVeining: false,
    stdDev: 20,
    hexColor: '#14aa55'
  });

  assert.ok(candidates.length >= 3);
  const topIds = candidates.slice(0, 3).map((c) => c.mineral?.id);
  assert.ok(topIds.includes('emerald') || topIds.includes('malachite'));
  assert.notEqual(candidates[0].mineral?.id, 'lapis-lazuli');
});

test('ruby red specimen matches Spinel / Garnet / Corundum', () => {
  const candidates = matchSpecimensByMineralogy({
    avgR: 210,
    avgG: 25,
    avgB: 45,
    brightnessPercent: 42,
    hasGoldSpecks: false,
    hasVeining: false,
    stdDev: 25,
    hexColor: '#d2192d'
  });

  const topIds = candidates.slice(0, 3).map((c) => c.mineral?.id);
  assert.ok(
    topIds.includes('spinel') ||
      topIds.includes('corundum') ||
      topIds.includes('garnet') ||
      topIds.includes('cinnabar')
  );
  assert.notEqual(candidates[0].mineral?.id, 'lapis-lazuli');
});

test('pitch black specimen matches Obsidian or Basalt or Magnetite', () => {
  const candidates = matchSpecimensByMineralogy({
    avgR: 15,
    avgG: 18,
    avgB: 20,
    brightnessPercent: 8,
    hasGoldSpecks: false,
    hasVeining: false,
    stdDev: 5,
    hexColor: '#0f1214'
  });

  const topIds = candidates.slice(0, 3).map((c) => c.mineral?.id);
  assert.ok(
    topIds.includes('obsidian') ||
      topIds.includes('basalt') ||
      topIds.includes('gabbro') ||
      topIds.includes('magnetite')
  );
});

test('magnetic trait immediately elevates Magnetite to top', () => {
  const candidates = matchSpecimensByMineralogy({
    avgR: 40,
    avgG: 40,
    avgB: 40,
    brightnessPercent: 16,
    hasGoldSpecks: false,
    hasVeining: false,
    stdDev: 10,
    hexColor: '#282828',
    fieldTraits: {
      isMagnetic: true
    }
  });

  assert.equal(candidates[0].mineral?.id, 'magnetite');
  assert.equal(candidates[0].name_fa, 'مگنتیت (اکسید مغناطیسی آهن)');
});

test('cherry red streak immediately elevates Hematite', () => {
  const candidates = matchSpecimensByMineralogy({
    avgR: 60,
    avgG: 65,
    avgB: 70,
    brightnessPercent: 25,
    hasGoldSpecks: false,
    hasVeining: false,
    stdDev: 12,
    hexColor: '#3c4146',
    fieldTraits: {
      streakColor: 'red_cherry'
    }
  });

  assert.equal(candidates[0].mineral?.id, 'hematite');
});
