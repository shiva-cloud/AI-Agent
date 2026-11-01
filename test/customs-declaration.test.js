import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCustomsDeclaration } from '../src/customs-declaration.js';

test('evaluateCustomsDeclaration: applies Tariff Item 9807.00.00 for Permanent Resident settlers', () => {
  const result = evaluateCustomsDeclaration({
    settlerStatus: 'pr',
    currencyCad: 8000,
    items: [
      { category: 'electronics', description: 'Apple MacBook Pro 16', valueCad: 3500, ownedMonths: 12, isAccompanying: true, serialNumber: 'C02G45ABCDEF' },
      { category: 'furniture', description: 'Living room wooden bookshelf', valueCad: 800, ownedMonths: 18, isAccompanying: false }
    ]
  });

  assert.equal(result.tariffClassification.code, '9807.00.00');
  assert.equal(result.settlerStatus, 'pr');
  assert.ok(result.tariffClassification.title.includes('Settlers'));
  assert.equal(result.financialAudit.totalDeclaredValueCad, 4300);
  assert.equal(result.financialAudit.accompanyingGoodsValueCad, 3500);
  assert.equal(result.financialAudit.goodsToFollowValueCad, 800);
  assert.equal(result.financialAudit.dutyExemptValueCad, 4300);
  assert.equal(result.financialAudit.taxableExcessValueCad, 0);
  assert.equal(result.financialAudit.estimatedDutyAndTaxSavingsCad, Math.round(4300 * 0.18));
  assert.equal(result.currencyCompliance.isDeclarationMandatory, false);
});

test('evaluateCustomsDeclaration: enforces 6-month ownership requirement under CBSA D2-2-1', () => {
  const result = evaluateCustomsDeclaration({
    settlerStatus: 'pr',
    items: [
      { category: 'electronics', description: 'Used Canon EOS Camera', valueCad: 2000, ownedMonths: 10, isAccompanying: true },
      { category: 'electronics', description: 'Brand new unopened OLED TV', valueCad: 1500, ownedMonths: 2, isAccompanying: true }
    ]
  });

  assert.equal(result.financialAudit.dutyExemptValueCad, 2000);
  assert.equal(result.financialAudit.taxableExcessValueCad, 1500);
  assert.ok(result.statutoryAdvisories.some(a => a.includes('Proof of 6 Months Ownership')));
});

test('evaluateCustomsDeclaration: flags mandatory currency reporting for funds >= $10,000 under PCMLTFA s.12', () => {
  const resultUnder = evaluateCustomsDeclaration({ currencyCad: 9999 });
  assert.equal(resultUnder.currencyCompliance.isDeclarationMandatory, false);
  assert.equal(resultUnder.currencyCompliance.mandatoryForm.includes('None'), true);

  const resultOver = evaluateCustomsDeclaration({ currencyCad: 15000 });
  assert.equal(resultOver.currencyCompliance.isDeclarationMandatory, true);
  assert.ok(resultOver.currencyCompliance.mandatoryForm.includes('Form E677'));
  assert.ok(resultOver.currencyCompliance.complianceNote.includes('CRITICAL STATUTORY REQUIREMENT'));
  assert.ok(resultOver.currencyCompliance.statute.includes('Proceeds of Crime'));
});

test('evaluateCustomsDeclaration: flags high-value jewelry and generates D2-2-1 para 14 appraisal notice', () => {
  const result = evaluateCustomsDeclaration({
    items: [
      { category: 'jewelry', description: '22K Gold Wedding Set', valueCad: 5000, ownedMonths: 24, isAccompanying: true, hasAppraisalReceipt: true },
      { category: 'clothing', description: 'Winter coats and boots', valueCad: 600, ownedMonths: 12, isAccompanying: true }
    ]
  });

  assert.equal(result.jewelryAudit.itemsDetected, 1);
  assert.equal(result.jewelryAudit.requiresAppraisalPhoto, true);
  assert.ok(result.jewelryAudit.statutoryInstructions.includes('Memorandum D2-2-1 para 14'));
  assert.ok(result.jewelryAudit.statutoryInstructions.includes('color photographs'));
});

test('evaluateCustomsDeclaration: detects restricted agricultural items and issues $1,300 fine warning', () => {
  const result = evaluateCustomsDeclaration({
    items: [
      { category: 'food', description: 'Homemade pork sausage and dry beef jerky', valueCad: 50, ownedMonths: 1, isAccompanying: true },
      { category: 'general', description: 'Cotton clothing', valueCad: 200, ownedMonths: 12, isAccompanying: true }
    ]
  });

  assert.equal(result.prohibitedItemsAlert.flaggedCount, 1);
  assert.ok(result.prohibitedItemsAlert.statutoryPenalty.includes('$1,300'));
  assert.ok(result.prohibitedItemsAlert.statutoryPenalty.includes('Agriculture and Agri-Food'));
});

test('evaluateCustomsDeclaration: calculates vehicle importation allowance, RIV exemption, and excise tax', () => {
  const resultOldCar = evaluateCustomsDeclaration({
    settlerStatus: 'pr',
    vehicle: {
      year: 2005,
      makeModel: 'Honda Civic',
      valueCad: 6000,
      hasAirConditioning: true
    }
  });

  assert.ok(resultOldCar.vehicleAudit);
  assert.equal(resultOldCar.vehicleAudit.is15YearsOrOlder, true);
  assert.ok(resultOldCar.vehicleAudit.rivExemption.includes('Exempt from Registrar of Imported Vehicles'));
  assert.equal(resultOldCar.vehicleAudit.airConditioningExciseTaxCad, 100);
  assert.equal(resultOldCar.vehicleAudit.exemptPortionCad, 6000);
  assert.equal(resultOldCar.vehicleAudit.taxableExcessCad, 0);

  const resultNewLuxuryCar = evaluateCustomsDeclaration({
    settlerStatus: 'pr',
    vehicle: {
      year: 2023,
      makeModel: 'Tesla Model Y',
      valueCad: 45000,
      hasAirConditioning: true
    }
  });

  assert.equal(resultNewLuxuryCar.vehicleAudit.is15YearsOrOlder, false);
  assert.ok(resultNewLuxuryCar.vehicleAudit.rivExemption.includes('RIV fee ~$325 CAD'));
  assert.equal(resultNewLuxuryCar.vehicleAudit.exemptPortionCad, 10000);
  assert.equal(resultNewLuxuryCar.vehicleAudit.taxableExcessCad, 35000);
});

test('evaluateCustomsDeclaration: organizes BSF186 accompanying vs BSF186A goods to follow manifests', () => {
  const result = evaluateCustomsDeclaration({
    settlerStatus: 'pr',
    items: [
      { category: 'electronics', description: 'Laptop', valueCad: 2000, ownedMonths: 12, isAccompanying: true, serialNumber: 'SN12345' },
      { category: 'clothing', description: 'Baggage Clothes', valueCad: 1000, ownedMonths: 12, isAccompanying: true },
      { category: 'furniture', description: 'Dining Table & Chairs', valueCad: 1500, ownedMonths: 12, isAccompanying: false },
      { category: 'books', description: 'Family Library 4 Boxes', valueCad: 500, ownedMonths: 24, isAccompanying: false }
    ]
  });

  assert.equal(result.bsf186Manifest.accompanyingCount, 2);
  assert.equal(result.bsf186Manifest.goodsToFollowCount, 2);
  assert.equal(result.bsf186Manifest.accompanyingGoods[0].serialNumber, 'SN12345');
  assert.ok(result.bsf186Manifest.portOfEntryChecklist.length >= 4);
  assert.ok(result.bsf186Manifest.portOfEntryChecklist.some(s => s.includes('Box 8')));
});
