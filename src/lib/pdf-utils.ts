import { useTechPackStore } from "@/store";
import { TechPackArticle, ArticleImage } from "@/types/tech-pack";
import { assetStorage } from "@/store/useDataStore";

/**
 * Resolves all "asset:ID" public_urls in an article's images to their actual base64 data.
 * Used before PDF generation to ensure images render without network calls.
 */
export async function resolveArticleAssets(article: TechPackArticle): Promise<TechPackArticle> {
  if (!article.images || article.images.length === 0) return article;

  const resolvedImages: ArticleImage[] = await Promise.all(
    article.images.map(async (img) => {
      if (img.public_url?.startsWith("asset:")) {
        const assetId = img.public_url.split(":")[1];
        const data = await assetStorage.get(assetId);
        return { ...img, public_url: data || img.public_url };
      }
      return img;
    })
  );

  return { ...article, images: resolvedImages };
}

/**
 * Resolves assets for all articles in a collection.
 */
export async function resolveCollectionAssets(articles: TechPackArticle[]): Promise<TechPackArticle[]> {
  return Promise.all(articles.map(resolveArticleAssets));
}
