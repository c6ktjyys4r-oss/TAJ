/**
    * Route integration tests for:
    *   POST   /api/upload
    *   GET    /api/documents/:id/file
    *   DELETE /api/documents/:id  (file-cleanup path)
    *
    * The pg pool and drizzle db are replaced with vi.mock so no real database
    * connection is required.
    *
    * Integrity tests (FK, UNIQUE, type) verify application-level behaviour
    * that mirrors what the database enforces:
    *   - document_files is always inserted BEFORE documents (FK ordering)
    *   - file_size is passed as an integer, never a string
    *   - a UNIQUE / FK violation from the DB (simulated) triggers rollback + 500
    *   - delete issues both DELETE queries atomically in one transaction
    */
    import { beforeEach, describe, expect, it, vi } from 'vitest';
    import request from 'supertest';

    // ---------------------------------------------------------------------------
    // Module mocks — vi.mock() is hoisted above imports by vitest's transformer
    // ---------------------------------------------------------------------------

    const mockClient = { query: vi.fn(), release: vi.fn() };

    vi.mock('../db/index', () => ({
    pool: { connect: vi.fn(), query: vi.fn(), end: vi.fn() },
    db:   { select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn() },
    }));

    vi.mock('../storage/index', () => ({
    getStorageProvider:   vi.fn(),
    setStorageProvider:   vi.fn(),
    resetStorageProvider: vi.fn(),
    }));

    // ---------------------------------------------------------------------------
    // Imports — after mocks
    // ---------------------------------------------------------------------------

    import app from '../index';
    import { pool, db } from '../db/index';
    import { getStorageProvider } from '../storage/index';

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    const fakePdf  = Buffer.from('%PDF-1.4 test');
    const fakeJpeg = Buffer.from('\xFF\xD8\xFF test');
    const fakePng  = Buffer.from('\x89PNG\r\n test');

    /** Wire up db.select() to return `rows` through the Drizzle chain. */
    function chainSelect(rows: unknown[]) {
    const where = vi.fn().mockResolvedValue(rows);
    const from  = vi.fn().mockReturnValue({ where });
    (db.select as ReturnType<typeof vi.fn>).mockReturnValue({ from });
    }

    /** Wire up pool.connect() client with sequential query responses. */
    function setupClient(responses: (object | null | undefined)[]) {
    mockClient.query.mockReset();
    mockClient.release.mockReset();
    let i = 0;
    mockClient.query.mockImplementation(() => {
      const resp = responses[i++];
      if (resp instanceof Error) return Promise.reject(resp);
      return Promise.resolve(resp ?? { rows: [] });
    });
    (pool.connect as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient);
    }

    // ---------------------------------------------------------------------------
    // POST /api/upload — validation (no DB access needed)
    // ---------------------------------------------------------------------------

    describe('POST /api/upload — validation', () => {
    it('400 when no file attached', async () => {
      const r = await request(app).post('/api/upload').send();
      expect(r.status).toBe(400);
      expect(r.body.error).toBe('NO_FILE');
    });

    it('415 for GIF (unsupported type)', async () => {
      const r = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('GIF89a'), { filename: 'anim.gif', contentType: 'image/gif' });
      expect(r.status).toBe(415);
      expect(r.body.error).toBe('UNSUPPORTED_MEDIA_TYPE');
    });

    it('415 for TIFF (not in allowed set)', async () => {
      const r = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('MM\x00*'), { filename: 'scan.tiff', contentType: 'image/tiff' });
      expect(r.status).toBe(415);
      expect(r.body.error).toBe('UNSUPPORTED_MEDIA_TYPE');
    });
    });

    // ---------------------------------------------------------------------------
    // POST /api/upload — transactional integrity
    // ---------------------------------------------------------------------------

    describe('POST /api/upload — transactional integrity', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    /**
     * FK ordering: document_files must be inserted BEFORE documents.
     * The FK constraint (documents.file_path → document_files.id) is checked
     * at statement execution time. Inserting the file first ensures the
     * referenced row exists when the documents INSERT runs.
     */
    it('inserts document_files before documents (FK ordering)', async () => {
      setupClient([
        undefined,                            // BEGIN
        { rows: [{ id: 'file-uuid' }] },      // INSERT document_files  ← must come first
        { rows: [{ id: 'doc-uuid', type: 'attachment', status: 'uploaded',
                   file_path: 'file-uuid', file_name: 'r.pdf', file_size: 13,
                   mime_type: 'application/pdf' }] },
        undefined,                            // COMMIT
      ]);

      await request(app)
        .post('/api/upload')
        .attach('file', fakePdf, { filename: 'r.pdf', contentType: 'application/pdf' });

      const queries = mockClient.query.mock.calls
        .map(([sql]: unknown[]) => sql?.toString?.() ?? '')
        .filter(s => s.includes('INSERT'));

      expect(queries[0]).toContain('document_files');   // file row first
      expect(queries[1]).toContain('documents');         // document row second
    });

    /**
     * file_size must be stored as an integer (not a string).
     * The `documents.file_size` column is integer after migration 0002.
     * Passing String(n) would be a type mismatch; we pass the raw number.
     */
    it('passes file_size as an integer, not a string', async () => {
      setupClient([
        undefined,
        { rows: [{ id: 'file-uuid' }] },
        { rows: [{ id: 'doc-uuid', type: 'attachment', file_path: 'file-uuid',
                   file_size: 13, mime_type: 'application/pdf' }] },
        undefined,
      ]);

      await request(app)
        .post('/api/upload')
        .attach('file', fakePdf, { filename: 'r.pdf', contentType: 'application/pdf' });

      // Find the INSERT INTO documents call and inspect the file_size parameter
      const docInsert = mockClient.query.mock.calls.find(
        ([sql]: unknown[]) => typeof sql === 'string' && sql.includes('INSERT INTO documents'),
      );
      expect(docInsert).toBeDefined();
      const fileSizeParam = (docInsert![1] as unknown[])[2]; // $3 in INSERT params
      expect(typeof fileSizeParam).toBe('number');
      expect(fileSizeParam).toBe(fakePdf.length);
    });

    /**
     * file_size must also be integer in the UPDATE path (attaching to existing doc).
     */
    it('passes file_size as integer in UPDATE (attach to existing doc)', async () => {
      setupClient([
        undefined,
        { rows: [{ id: 'file-new' }] },
        { rows: [{ id: 'doc-x', file_path: null }] },
        { rows: [{ id: 'doc-x', type: 'invoice', file_path: 'file-new', file_size: 13 }] },
        undefined,
      ]);

      await request(app)
        .post('/api/upload')
        .field('documentId', 'doc-x')
        .attach('file', fakePdf, { filename: 'r.pdf', contentType: 'application/pdf' });

      const updateCall = mockClient.query.mock.calls.find(
        ([sql]: unknown[]) => typeof sql === 'string' && sql.includes('UPDATE documents'),
      );
      expect(updateCall).toBeDefined();
      const fileSizeParam = (updateCall![1] as unknown[])[2]; // $3 in UPDATE params
      expect(typeof fileSizeParam).toBe('number');
      expect(fileSizeParam).toBe(fakePdf.length);
    });

    /**
     * UNIQUE constraint violation simulation (error code 23505).
     * If the DB rejects the documents INSERT because another document already
     * holds the same file_path (an impossible race in normal operation, but
     * DB-enforced), the app must roll back and return 500.
     */
    it('rolls back and returns 500 on UNIQUE constraint violation (23505)', async () => {
      const uniqueErr = Object.assign(new Error('duplicate key value violates unique constraint'), {
        code: '23505',
      });
      mockClient.query.mockReset();
      mockClient.release.mockReset();
      mockClient.query
        .mockResolvedValueOnce(undefined)          // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 'file-uuid' }] }) // INSERT document_files
        .mockRejectedValueOnce(uniqueErr)           // INSERT documents — UNIQUE violation
        .mockResolvedValue(undefined);             // ROLLBACK
      (pool.connect as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient);

      const r = await request(app)
        .post('/api/upload')
        .attach('file', fakePdf, { filename: 'r.pdf', contentType: 'application/pdf' });

      expect(r.status).toBe(500);
      expect(r.body.error).toBe('INTERNAL_SERVER_ERROR');

      // ROLLBACK must have been issued
      const rollbackCall = mockClient.query.mock.calls.find(
        ([sql]: unknown[]) => typeof sql === 'string' && sql.toUpperCase() === 'ROLLBACK',
      );
      expect(rollbackCall).toBeDefined();
      expect(mockClient.release).toHaveBeenCalledOnce();
    });

    /**
     * FK violation simulation (error code 23503).
     * If the DB rejects the documents INSERT because the referenced
     * document_files row does not exist (this would indicate a logic bug),
     * the app rolls back and returns 500.
     */
    it('rolls back and returns 500 on FK violation (23503)', async () => {
      const fkErr = Object.assign(
        new Error('insert or update on table "documents" violates foreign key constraint'),
        { code: '23503' },
      );
      mockClient.query.mockReset();
      mockClient.release.mockReset();
      mockClient.query
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ rows: [{ id: 'file-uuid' }] })
        .mockRejectedValueOnce(fkErr)
        .mockResolvedValue(undefined);
      (pool.connect as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient);

      const r = await request(app)
        .post('/api/upload')
        .attach('file', fakePdf, { filename: 'r.pdf', contentType: 'application/pdf' });

      expect(r.status).toBe(500);
      expect(r.body.error).toBe('INTERNAL_SERVER_ERROR');
      expect(mockClient.release).toHaveBeenCalledOnce();
    });
    });

    // ---------------------------------------------------------------------------
    // POST /api/upload — happy paths
    // ---------------------------------------------------------------------------

    describe('POST /api/upload — successful uploads', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('201 + storageKey when uploading a PDF (new document)', async () => {
      setupClient([
        undefined,
        { rows: [{ id: 'file-pdf' }] },
        { rows: [{ id: 'doc-1', type: 'attachment', status: 'uploaded',
                   file_path: 'file-pdf', file_name: 'r.pdf', file_size: 13,
                   mime_type: 'application/pdf' }] },
        undefined,
      ]);

      const r = await request(app)
        .post('/api/upload')
        .attach('file', fakePdf, { filename: 'r.pdf', contentType: 'application/pdf' });

      expect(r.status).toBe(201);
      expect(r.body.document.type).toBe('attachment');
      expect(r.body.file.storageKey).toBe('file-pdf');
      expect(r.body.file.mime).toBe('application/pdf');
      expect(mockClient.release).toHaveBeenCalledOnce();
    });

    it('201 when uploading a JPEG', async () => {
      setupClient([
        undefined,
        { rows: [{ id: 'file-jpg' }] },
        { rows: [{ id: 'doc-2', type: 'attachment', file_path: 'file-jpg', mime_type: 'image/jpeg' }] },
        undefined,
      ]);

      const r = await request(app)
        .post('/api/upload')
        .attach('file', fakeJpeg, { filename: 'photo.jpg', contentType: 'image/jpeg' });

      expect(r.status).toBe(201);
      expect(r.body.file.mime).toBe('image/jpeg');
    });

    it('201 when uploading a PNG', async () => {
      setupClient([
        undefined,
        { rows: [{ id: 'file-png' }] },
        { rows: [{ id: 'doc-3', type: 'attachment', file_path: 'file-png', mime_type: 'image/png' }] },
        undefined,
      ]);

      const r = await request(app)
        .post('/api/upload')
        .attach('file', fakePng, { filename: 'chart.png', contentType: 'image/png' });

      expect(r.status).toBe(201);
      expect(r.body.file.mime).toBe('image/png');
    });

    it('200 + replaces old file atomically (old document_files row deleted in same tx)', async () => {
      setupClient([
        undefined,                                                       // BEGIN
        { rows: [{ id: 'file-new' }] },                                  // INSERT document_files
        { rows: [{ id: 'doc-x', file_path: 'file-old' }] },             // SELECT existing
        { rows: [{ id: 'doc-x', type: 'invoice', file_path: 'file-new', file_size: 13 }] }, // UPDATE
        { rows: [], rowCount: 1 },                                       // DELETE old file
        undefined,                                                       // COMMIT
      ]);

      const r = await request(app)
        .post('/api/upload')
        .field('documentId', 'doc-x')
        .attach('file', fakePdf, { filename: 'inv.pdf', contentType: 'application/pdf' });

      expect(r.status).toBe(200);
      expect(r.body.file.storageKey).toBe('file-new');

      // Old file deleted inside the same transaction (before COMMIT)
      const dels = mockClient.query.mock.calls.filter(
        ([sql]: unknown[]) => typeof sql === 'string' && sql.includes('DELETE FROM document_files'),
      );
      expect(dels).toHaveLength(1);
      expect(dels[0][1]).toEqual(['file-old']);

      const commitIdx = mockClient.query.mock.calls.findIndex(
        ([sql]: unknown[]) => typeof sql === 'string' && sql.toUpperCase() === 'COMMIT',
      );
      const delIdx = mockClient.query.mock.calls.findIndex(
        ([sql, params]: unknown[]) =>
          typeof sql === 'string' &&
          sql.includes('DELETE FROM document_files') &&
          Array.isArray(params) && params[0] === 'file-old',
      );
      expect(delIdx).toBeGreaterThan(0);
      expect(delIdx).toBeLessThan(commitIdx); // delete happens before commit
    });

    it('200 + no document_files DELETE when document had no prior file', async () => {
      setupClient([
        undefined,
        { rows: [{ id: 'file-first' }] },
        { rows: [{ id: 'doc-y', file_path: null }] },
        { rows: [{ id: 'doc-y', file_path: 'file-first', file_size: 13 }] },
        undefined,
      ]);

      const r = await request(app)
        .post('/api/upload')
        .field('documentId', 'doc-y')
        .attach('file', fakePdf, { filename: 'new.pdf', contentType: 'application/pdf' });

      expect(r.status).toBe(200);
      const dels = mockClient.query.mock.calls.filter(
        ([sql]: unknown[]) => typeof sql === 'string' && sql.includes('DELETE FROM document_files'),
      );
      expect(dels).toHaveLength(0);
    });
    });

    // ---------------------------------------------------------------------------
    // POST /api/upload — error paths
    // ---------------------------------------------------------------------------

    describe('POST /api/upload — error paths', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('404 when documentId does not exist', async () => {
      setupClient([
        undefined,
        { rows: [{ id: 'f' }] },
        { rows: [] },    // SELECT existing → not found → triggers ROLLBACK + 404
        undefined,
      ]);

      const r = await request(app)
        .post('/api/upload')
        .field('documentId', 'no-such-doc')
        .attach('file', fakePdf, { filename: 'test.pdf', contentType: 'application/pdf' });

      expect(r.status).toBe(404);
      expect(r.body.error).toBe('DOCUMENT_NOT_FOUND');
      expect(mockClient.release).toHaveBeenCalledOnce();
    });

    it('500 + rollback on arbitrary DB error', async () => {
      mockClient.query.mockReset();
      mockClient.release.mockReset();
      mockClient.query
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('DB down'))
        .mockResolvedValue(undefined);
      (pool.connect as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient);

      const r = await request(app)
        .post('/api/upload')
        .attach('file', fakePdf, { filename: 'test.pdf', contentType: 'application/pdf' });

      expect(r.status).toBe(500);
      expect(r.body.error).toBe('INTERNAL_SERVER_ERROR');
      expect(mockClient.release).toHaveBeenCalledOnce();
    });
    });

    // ---------------------------------------------------------------------------
    // GET /api/documents/:id/file
    // ---------------------------------------------------------------------------

    describe('GET /api/documents/:id/file', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('200 + correct headers when file exists', async () => {
      chainSelect([{ id: 'doc-1', file_path: 'sk-1', file_name: 'report.pdf', mime_type: 'application/pdf' }]);
      (getStorageProvider as ReturnType<typeof vi.fn>).mockReturnValue({
        get: vi.fn().mockResolvedValue({
          storageKey: 'sk-1', originalName: 'report.pdf',
          mimeType: 'application/pdf', sizeBytes: 13, content: fakePdf,
        }),
      });

      const r = await request(app).get('/api/documents/doc-1/file');

      expect(r.status).toBe(200);
      expect(r.headers['content-type']).toContain('application/pdf');
      expect(r.headers['content-disposition']).toContain('report.pdf');
      expect(Buffer.from(r.body)).toEqual(fakePdf);
    });

    it('404 when document does not exist', async () => {
      chainSelect([]);
      const r = await request(app).get('/api/documents/no-id/file');
      expect(r.status).toBe(404);
      expect(r.body.error).toBe('DOCUMENT_NOT_FOUND');
    });

    it('404 when document has no attached file (file_path is NULL)', async () => {
      chainSelect([{ id: 'doc-2', file_path: null }]);
      const r = await request(app).get('/api/documents/doc-2/file');
      expect(r.status).toBe(404);
      expect(r.body.error).toBe('NO_FILE');
    });
    });

    // ---------------------------------------------------------------------------
    // DELETE /api/documents/:id — cascade delete (application-enforced)
    // ---------------------------------------------------------------------------

    describe('DELETE /api/documents/:id — cascade delete', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    /**
     * When a document is deleted, the associated document_files row must be
     * deleted in the same transaction (BEGIN/COMMIT) so no orphaned file
     * bytes can exist after the transaction commits.
     */
    it('204 + deletes document and file atomically (both in same transaction)', async () => {
      chainSelect([{ id: 'doc-del', file_path: 'sk-del', type: 'invoice', status: 'uploaded' }]);
      setupClient([
        undefined,                   // BEGIN
        { rows: [], rowCount: 1 },   // DELETE documents
        { rows: [], rowCount: 1 },   // DELETE document_files
        undefined,                   // COMMIT
      ]);

      const r = await request(app).delete('/api/documents/doc-del');
      expect(r.status).toBe(204);

      const queries = mockClient.query.mock.calls.map(([sql]: unknown[]) => sql?.toString?.() ?? '');
      const beginIdx  = queries.findIndex(s => s.toUpperCase() === 'BEGIN');
      const commitIdx = queries.findIndex(s => s.toUpperCase() === 'COMMIT');
      const docDelIdx  = queries.findIndex(s => s.includes('DELETE FROM documents'));
      const fileDelIdx = queries.findIndex(s => s.includes('DELETE FROM document_files'));

      expect(beginIdx).toBeGreaterThanOrEqual(0);
      expect(fileDelIdx).toBeGreaterThan(beginIdx);
      expect(fileDelIdx).toBeLessThan(commitIdx);  // file deleted within the transaction
      expect(docDelIdx).toBeGreaterThan(beginIdx);
      expect(docDelIdx).toBeLessThan(commitIdx);   // doc deleted within the transaction

      // Correct file key passed to DELETE
      const fileDelArgs = mockClient.query.mock.calls[fileDelIdx][1] as string[];
      expect(fileDelArgs).toEqual(['sk-del']);
    });

    /**
     * One-file-per-document: the UNIQUE constraint ensures each document_files
     * row is referenced by at most one document. So deleting the document and
     * its file is safe — no other document references that file.
     */
    it('204 + no document_files DELETE when file_path is NULL (no orphan risk)', async () => {
      chainSelect([{ id: 'doc-nf', file_path: null, type: 'invoice', status: 'uploaded' }]);
      setupClient([
        undefined,
        { rows: [], rowCount: 1 },
        undefined,
      ]);

      const r = await request(app).delete('/api/documents/doc-nf');
      expect(r.status).toBe(204);

      const fileDelCalls = mockClient.query.mock.calls.filter(
        ([sql]: unknown[]) => typeof sql === 'string' && sql.includes('DELETE FROM document_files'),
      );
      expect(fileDelCalls).toHaveLength(0);
    });

    it('404 when the document does not exist', async () => {
      chainSelect([]);
      const r = await request(app).delete('/api/documents/ghost');
      expect(r.status).toBe(404);
      expect(r.body.error).toBe('DOCUMENT_NOT_FOUND');
    });

    /**
     * Delete-side rollback: if the document_files DELETE fails, the whole
     * transaction is rolled back — neither the document row nor the file row
     * is removed. No inconsistency can persist.
     */
    it('500 + full rollback if document_files DELETE fails', async () => {
      chainSelect([{ id: 'doc-err', file_path: 'sk-err', type: 'invoice', status: 'uploaded' }]);
      mockClient.query.mockReset();
      mockClient.release.mockReset();
      mockClient.query
        .mockResolvedValueOnce(undefined)              // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // DELETE documents (succeeds)
        .mockRejectedValueOnce(new Error('lock timeout')) // DELETE document_files (fails)
        .mockResolvedValue(undefined);                 // ROLLBACK
      (pool.connect as ReturnType<typeof vi.fn>).mockResolvedValue(mockClient);

      const r = await request(app).delete('/api/documents/doc-err');
      expect(r.status).toBe(500);
      expect(r.body.error).toBe('INTERNAL_SERVER_ERROR');

      const rollbackCall = mockClient.query.mock.calls.find(
        ([sql]: unknown[]) => typeof sql === 'string' && sql.toUpperCase() === 'ROLLBACK',
      );
      expect(rollbackCall).toBeDefined();
      expect(mockClient.release).toHaveBeenCalledOnce();
    });
    });
    