/**
    * Route integration tests for:
    *   POST   /api/upload
    *   GET    /api/documents/:id/file
    *   DELETE /api/documents/:id  (file-cleanup path)
    *
    * The pg pool and drizzle db are replaced with vi.mock so no real database
    * connection is needed.
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
    // Imports after mocks
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
    function setupClient(responses: (object | undefined)[]) {
    mockClient.query.mockReset();
    mockClient.release.mockReset();
    let i = 0;
    mockClient.query.mockImplementation(() => Promise.resolve(responses[i++] ?? { rows: [] }));
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
    // POST /api/upload — happy paths
    // ---------------------------------------------------------------------------

    describe('POST /api/upload — successful uploads', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('201 + storageKey when uploading a PDF (new document)', async () => {
      setupClient([
        undefined,                            // BEGIN
        { rows: [{ id: 'file-pdf' }] },       // INSERT document_files
        { rows: [{ id: 'doc-1', type: 'attachment', status: 'uploaded',
                   file_path: 'file-pdf', file_name: 'r.pdf', file_size: '13', mime_type: 'application/pdf' }] },
        undefined,                            // COMMIT
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

    it('200 + replaces old file when attaching to existing document', async () => {
      setupClient([
        undefined,                                                      // BEGIN
        { rows: [{ id: 'file-new' }] },                                 // INSERT document_files
        { rows: [{ id: 'doc-x', file_path: 'file-old' }] },            // SELECT existing
        { rows: [{ id: 'doc-x', type: 'invoice', file_path: 'file-new' }] }, // UPDATE
        { rows: [], rowCount: 1 },                                      // DELETE old file
        undefined,                                                      // COMMIT
      ]);

      const r = await request(app)
        .post('/api/upload')
        .field('documentId', 'doc-x')
        .attach('file', fakePdf, { filename: 'inv.pdf', contentType: 'application/pdf' });

      expect(r.status).toBe(200);
      expect(r.body.file.storageKey).toBe('file-new');

      const dels = mockClient.query.mock.calls.filter(
        ([sql]: [string]) => typeof sql === 'string' && sql.includes('DELETE FROM document_files'),
      );
      expect(dels).toHaveLength(1);
      expect(dels[0][1]).toEqual(['file-old']);
    });

    it('200 + no old-file DELETE when document had no prior file', async () => {
      setupClient([
        undefined,
        { rows: [{ id: 'file-first' }] },
        { rows: [{ id: 'doc-y', file_path: null }] },
        { rows: [{ id: 'doc-y', file_path: 'file-first' }] },
        undefined,   // COMMIT (no DELETE)
      ]);

      const r = await request(app)
        .post('/api/upload')
        .field('documentId', 'doc-y')
        .attach('file', fakePdf, { filename: 'new.pdf', contentType: 'application/pdf' });

      expect(r.status).toBe(200);
      const dels = mockClient.query.mock.calls.filter(
        ([sql]: [string]) => typeof sql === 'string' && sql.includes('DELETE FROM document_files'),
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
        { rows: [] },    // SELECT existing → not found
        undefined,       // ROLLBACK
      ]);

      const r = await request(app)
        .post('/api/upload')
        .field('documentId', 'no-such-doc')
        .attach('file', fakePdf, { filename: 'test.pdf', contentType: 'application/pdf' });

      expect(r.status).toBe(404);
      expect(r.body.error).toBe('DOCUMENT_NOT_FOUND');
      expect(mockClient.release).toHaveBeenCalledOnce();
    });

    it('500 + rollback on DB error', async () => {
      mockClient.query.mockReset();
      mockClient.release.mockReset();
      mockClient.query
        .mockResolvedValueOnce(undefined)            // BEGIN
        .mockRejectedValueOnce(new Error('DB down')) // INSERT document_files fails
        .mockResolvedValue(undefined);               // ROLLBACK
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

    it('404 when document has no attached file', async () => {
      chainSelect([{ id: 'doc-2', file_path: null }]);
      const r = await request(app).get('/api/documents/doc-2/file');
      expect(r.status).toBe(404);
      expect(r.body.error).toBe('NO_FILE');
    });
    });

    // ---------------------------------------------------------------------------
    // DELETE /api/documents/:id — with file cleanup
    // ---------------------------------------------------------------------------

    describe('DELETE /api/documents/:id', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    it('204 + atomically deletes document and stored file', async () => {
      chainSelect([{ id: 'doc-del', file_path: 'sk-del', type: 'invoice', status: 'uploaded' }]);
      setupClient([
        undefined,
        { rows: [], rowCount: 1 },   // DELETE documents
        { rows: [], rowCount: 1 },   // DELETE document_files
        undefined,                   // COMMIT
      ]);

      const r = await request(app).delete('/api/documents/doc-del');
      expect(r.status).toBe(204);

      const fileDels = mockClient.query.mock.calls.filter(
        ([sql]: [string]) => typeof sql === 'string' && sql.includes('DELETE FROM document_files'),
      );
      expect(fileDels).toHaveLength(1);
      expect(fileDels[0][1]).toEqual(['sk-del']);
    });

    it('204 + no document_files DELETE when doc has no file', async () => {
      chainSelect([{ id: 'doc-nf', file_path: null, type: 'invoice', status: 'uploaded' }]);
      setupClient([
        undefined,
        { rows: [], rowCount: 1 },
        undefined,
      ]);

      const r = await request(app).delete('/api/documents/doc-nf');
      expect(r.status).toBe(204);

      const fileDels = mockClient.query.mock.calls.filter(
        ([sql]: [string]) => typeof sql === 'string' && sql.includes('DELETE FROM document_files'),
      );
      expect(fileDels).toHaveLength(0);
    });

    it('404 when document does not exist', async () => {
      chainSelect([]);
      const r = await request(app).delete('/api/documents/ghost');
      expect(r.status).toBe(404);
      expect(r.body.error).toBe('DOCUMENT_NOT_FOUND');
    });
    });
    