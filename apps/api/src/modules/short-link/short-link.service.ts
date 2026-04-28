import { nanoid } from "nanoid";
import { ShortLink, CreateShortLinkRequest } from "@odin-pulse/shared";
import { shortLinkRepository } from "./short-link.repository.js";
import { snowflake } from "../../lib/snowflake.js";
import { ConflictError } from "../../lib/errors.js";

export class ShortLinkService {
  async create(userId: string, data: CreateShortLinkRequest): Promise<ShortLink> {
    let slug = data.slug;
    
    if (slug) {
      const existing = await shortLinkRepository.findBySlug(slug);
      if (existing) {
        throw new ConflictError("该 Slug 已被占用，请尝试其他名称");
      }
    } else {
      // Generate a random slug if not provided
      let isUnique = false;
      while (!isUnique) {
        slug = nanoid(6);
        const existing = await shortLinkRepository.findBySlug(slug);
        if (!existing) isUnique = true;
      }
    }

    if (!slug) throw new Error("Failed to generate slug");

    return shortLinkRepository.create({
      id: snowflake.nextId(),
      slug,
      originalUrl: data.originalUrl,
      description: data.description,
      createdBy: userId,
    });
  }

  async resolve(slug: string): Promise<string | null> {
    const link = await shortLinkRepository.findBySlug(slug);
    if (!link) return null;

    // Async increment visit count
    shortLinkRepository.incrementVisitCount(slug).catch(console.error);

    return link.originalUrl;
  }

  async list(userId?: string): Promise<{ items: ShortLink[]; total: number }> {
    return shortLinkRepository.list(userId);
  }

  async delete(userId: string, id: string): Promise<boolean> {
    return shortLinkRepository.delete(id, userId);
  }
}

export const shortLinkService = new ShortLinkService();
