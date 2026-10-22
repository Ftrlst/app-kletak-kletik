import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransitionOrder, getNextPossibleStates } from './orderStateMachine.ts';

test('Order State Machine - Initial state PENDING transitions', () => {
  // PENDING can transition to DIKONFIRMASI on payment
  assert.equal(canTransitionOrder('PENDING', 'DIKONFIRMASI'), true);
  // PENDING can be cancelled
  assert.equal(canTransitionOrder('PENDING', 'DIBATALKAN'), true);
  // PENDING can expire
  assert.equal(canTransitionOrder('PENDING', 'EXPIRED'), true);
  // PENDING cannot jump directly to SELESAI or DIKEMAS
  assert.equal(canTransitionOrder('PENDING', 'SELESAI'), false);
  assert.equal(canTransitionOrder('PENDING', 'DIKEMAS'), false);
});

test('Order State Machine - Fulfillment routing (delivery vs pickup)', () => {
  // For delivery: DIKEMAS -> SIAP_DIANTAR
  assert.equal(canTransitionOrder('DIKEMAS', 'SIAP_DIANTAR', 'delivery'), true);
  assert.equal(canTransitionOrder('DIKEMAS', 'SIAP_DIAMBIL', 'delivery'), false);

  // For pickup: DIKEMAS -> SIAP_DIAMBIL
  assert.equal(canTransitionOrder('DIKEMAS', 'SIAP_DIAMBIL', 'pickup'), true);
  assert.equal(canTransitionOrder('DIKEMAS', 'SIAP_DIANTAR', 'pickup'), false);
});

test('Order State Machine - Completion and terminal states', () => {
  // SIAP_DIANTAR can transition to SELESAI
  assert.equal(canTransitionOrder('SIAP_DIANTAR', 'SELESAI', 'delivery'), true);
  // SIAP_DIAMBIL can transition to SELESAI
  assert.equal(canTransitionOrder('SIAP_DIAMBIL', 'SELESAI', 'pickup'), true);

  // SELESAI is terminal, cannot transition anywhere
  assert.equal(canTransitionOrder('SELESAI', 'PENDING'), false);
  assert.equal(canTransitionOrder('SELESAI', 'DIKONFIRMASI'), false);
  assert.equal(canTransitionOrder('SELESAI', 'DIBATALKAN'), false);

  const nextFromSelesai = getNextPossibleStates('SELESAI');
  assert.equal(nextFromSelesai.length, 0);
});
