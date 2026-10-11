import { describe, it, expect } from 'vitest';
import { generateDataHash, verifyDataHash, type TransactionPayload } from './crypto';

describe('StokVault Cryptographic Component Unit Tests', () => {
  const validPayload: TransactionPayload = {
    transactionId: 'LF-2610-005',
    hotelId: 'grand-hyatt',
    timestamp: '2026-10-11T10:00:00Z',
    totalItems: 22
  };

  // UJI POSITIF 1
  it('1. Output hash harus berformat Hexadecimal SHA-256 sepanjang 64 karakter', () => {
    const hash = generateDataHash(validPayload);
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  // UJI POSITIF 2
  it('2. Verifikasi data harus berhasil (true) jika payload tidak diubah', () => {
    const hash = generateDataHash(validPayload);
    const isValid = verifyDataHash(validPayload, hash);
    expect(isValid).toBe(true);
  });

  // UJI POSITIF 3
  it('3. Fungsi harus bersifat deterministik (input sama menghasilkan hash identik)', () => {
    const hashA = generateDataHash(validPayload);
    const hashB = generateDataHash(validPayload);
    expect(hashA).toBe(hashB);
  });

  // UJI NEGATIF / BATAS (Edge Case)
  it('4. [UJI NEGATIF] Verifikasi harus gagal (false) jika data transaksi dimanipulasi', () => {
    const originalHash = generateDataHash(validPayload);
    
    // Simulasi manipulasi data (jumlah barang diubah)
    const tamperedPayload = { ...validPayload, totalItems: 999 };
    const isValid = verifyDataHash(tamperedPayload, originalHash);
    
    expect(isValid).toBe(false);
  });
});