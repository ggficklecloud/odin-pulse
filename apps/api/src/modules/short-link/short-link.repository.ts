import { getPostgresPool } from "../../lib/postgres.js";
import { ShortLink } from "@odin-pulse/shared";

export class ShortLinkRepository {
  async create(data: Omit<ShortLink, "visitCount" | "createdAt" | "updatedAt">): Promise<ShortLink> {
    const pool = getPostgresPool();
    const result = await pool.query(
      `INSERT INTO short_links (id, slug, original_url, description, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.id, data.slug, data.originalUrl, data.description, data.createdBy]
    );
    return this.mapToModel(result.rows[0]);
  }

  async findBySlug(slug: string): Promise<ShortLink | null> {
    const pool = getPostgresPool();
    const result = await pool.query("SELECT * FROM short_links WHERE slug = $1", [slug]);
    if (result.rowCount === 0) return null;
    return this.mapToModel(result.rows[0]);
  }

  async incrementVisitCount(slug: string): Promise<void> {
    const pool = getPostgresPool();
    await pool.query(
      "UPDATE short_links SET visit_count = visit_count + 1, updated_at = CURRENT_TIMESTAMP WHERE slug = $1",
      [slug]
    );
  }

  async list(createdBy?: string): Promise<{ items: ShortLink[]; total: number }> {
    const pool = getPostgresPool();
    let query = "SELECT * FROM short_links";
    const params: any[] = [];

    if (createdBy) {
      query += " WHERE created_by = $1";
      params.push(createdBy);
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      createdBy ? "SELECT COUNT(*) FROM short_links WHERE created_by = $1" : "SELECT COUNT(*) FROM short_links",
      params
    );

    return {
      items: result.rows.map((row) => this.mapToModel(row)),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async delete(id: string, createdBy: string): Promise<boolean> {
    const pool = getPostgresPool();
    const result = await pool.query(
      "DELETE FROM short_links WHERE id = $1 AND created_by = $2",
      [id, createdBy]
    );
    return (result.rowCount ?? 0) > 0;
  }

  private mapToModel(row: any): ShortLink {
    return {
      id: row.id.toString(),
      slug: row.slug,
      originalUrl: row.original_url,
      description: row.description,
      visitCount: parseInt(row.visit_count, 10),
      createdBy: row.created_by,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}

export const shortLinkRepository = new ShortLinkRepository();
