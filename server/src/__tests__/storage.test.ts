import { describe, expect, it, vi } from 'vitest';
    import { PostgresStorageProvider } from '../storage/postgres-provider';
    import type { Pool } from 'pg';

    // ── Helpers ───────────────────────────────────────────────────────────────────

    const fakePdf  = Buffer.from('%PDF-1.4 fake content');
    const fakeJpeg = Buffer.from('\xFF\xD8\xFF fake jpeg');
    const fakePng  = Buffer.from('\x89PNG\r\n fake png');

    function makePool(rows: object[]): Pool {
    let call = 0;
    return { query: vi.fn(() => Promise.resolve({ rows: rows[call++] ?? [] })) } as unknown as Pool;
    }

    function spyPool(): { pool: Pool; spy: ReturnType<typeof vi.fn> } {
    const spy = vi.fn();
    return { pool: { query: spy } as unknown as Pool, spy };
    }

    // ── put() ─────────────────────────────────────────────────────────────────────

    describe('PostgresStorageProvider.put()', () => {
    it('inserts the file and returns correct metadata', async () => {
      const { pool, spy } = spyPool();
      spy.mockResolvedValue({
        rows: [{ id: 'uuid-1', file_name: 'doc.pdf', mime_type: 'application/pdf', file_size: '21' }],
      });
      const provider = new PostgresStorageProvider(pool);

      const result = await provider.put({
        buffer: fakePdf, originalName: 'doc.pdf', mimeType: 'application/pdf', sizeBytes: 21,
      });

      expect(result).toEqual({
        storageKey: 'uuid-1', originalName: 'doc.pdf', mimeType: 'application/pdf', sizeBytes: 21,
      });
    });

    it('passes file bytes as the fourth SQL parameter', async () => {
      const { pool, spy } = spyPool();
      spy.mockResolvedValue({
        rows: [{ id: 'u', file_name: 'photo.jpg', mime_type: 'image/jpeg', file_size: '22' }],
      });
      await new PostgresStorageProvider(pool).put({
        buffer: fakeJpeg, originalName: 'photo.jpg', mimeType: 'image/jpeg', sizeBytes: 22,
      });
      const [sql, params] = spy.mock.calls[0] as [string, unknown[]];
      expect(sql).toContain('INSERT INTO document_files');
      expect(params[3]).toEqual(fakeJpeg);
    });

    it('stores PNG files', async () => {
      const { pool, spy } = spyPool();
      spy.mockResolvedValue({
        rows: [{ id: 'u', file_name: 'img.png', mime_type: 'image/png', file_size: '22' }],
      });
      const r = await new PostgresStorageProvider(pool).put({
        buffer: fakePng, originalName: 'img.png', mimeType: 'image/png', sizeBytes: 22,
      });
      expect(r.mimeType).toBe('image/png');
    });

    it('propagates database errors', async () => {
      const { pool, spy } = spyPool();
      spy.mockRejectedValue(new Error('DB connection lost'));
      await expect(
        new PostgresStorageProvider(pool).put({
          buffer: fakePdf, originalName: 'a.pdf', mimeType: 'application/pdf', sizeBytes: 5,
        }),
      ).rejects.toThrow('DB connection lost');
    });
    });

    // ── get() ─────────────────────────────────────────────────────────────────────

    describe('PostgresStorageProvider.get()', () => {
    it('retrieves a stored file by storage key', async () => {
      const { pool, spy } = spyPool();
      spy.mockResolvedValue({
        rows: [{ id: 'uuid-1', file_name: 'doc.pdf', mime_type: 'application/pdf', file_size: '21', content: fakePdf }],
      });
      const r = await new PostgresStorageProvider(pool).get('uuid-1');
      expect(r.storageKey).toBe('uuid-1');
      expect(r.content).toEqual(fakePdf);
      expect(r.sizeBytes).toBe(21);
    });

    it('queries by the supplied storage key', async () => {
      const { pool, spy } = spyPool();
      spy.mockResolvedValue({
        rows: [{ id: 'abc', file_name: 'x.pdf', mime_type: 'application/pdf', file_size: '10', content: fakePdf }],
      });
      await new PostgresStorageProvider(pool).get('abc');
      const [, params] = spy.mock.calls[0] as [string, unknown[]];
      expect(params).toEqual(['abc']);
    });

    it('throws ENOENT when the storage key does not exist', async () => {
      const pool = makePool([[]]);
      await expect(new PostgresStorageProvider(pool).get('missing')).rejects.toMatchObject({ code: 'ENOENT' });
    });

    it('casts file_size string to number', async () => {
      const { pool, spy } = spyPool();
      spy.mockResolvedValue({
        rows: [{ id: 'x', file_name: 'f.pdf', mime_type: 'application/pdf', file_size: '1048576', content: fakePdf }],
      });
      const r = await new PostgresStorageProvider(pool).get('x');
      expect(r.sizeBytes).toBe(1048576);
      expect(typeof r.sizeBytes).toBe('number');
    });
    });

    // ── remove() ──────────────────────────────────────────────────────────────────

    describe('PostgresStorageProvider.remove()', () => {
    it('issues a DELETE for the given key', async () => {
      const { pool, spy } = spyPool();
      spy.mockResolvedValue({ rows: [], rowCount: 1 });
      await new PostgresStorageProvider(pool).remove('uuid-to-delete');
      const [sql, params] = spy.mock.calls[0] as [string, unknown[]];
      expect(sql).toContain('DELETE FROM document_files');
      expect(params).toEqual(['uuid-to-delete']);
    });

    it('resolves silently when the key does not exist (idempotent)', async () => {
      const pool = makePool([[{ rowCount: 0 }]]);
      await expect(new PostgresStorageProvider(pool).remove('nonexistent')).resolves.toBeUndefined();
    });

    it('propagates database errors', async () => {
      const { pool, spy } = spyPool();
      spy.mockRejectedValue(new Error('Timeout'));
      await expect(new PostgresStorageProvider(pool).remove('key')).rejects.toThrow('Timeout');
    });
    });
    