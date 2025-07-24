// infrastructure/queues/handlers/FullShortCodePoolJobHandler.ts
import { JobHandler } from '../QueueManager';
import { RedisClient } from '../../redis/RedisClient';
import { container } from '../../../di/Container';

export class FullShortCodePoolJobHandler implements JobHandler {
  private readonly shortCodeGeneratorHelper = container.getShortCodeGenerator();
  private readonly urlRepository = container.getUrlRepository();
  private readonly poolKey = 'shortcode_pool';
  private readonly desiredPoolSize = 1000;
  private readonly batchSize = 500; // Kaç kod üretip kontrol edeceğiz

  async handle(): Promise<void> {
    const client = RedisClient.getInstance();

    // Redis'ten havuzdaki mevcut kodları al
    const currentPoolSize = await client.llen(this.poolKey);
    const codesToGenerate = this.desiredPoolSize - currentPoolSize;

    if (codesToGenerate <= 0) {
      console.log('Short code pool is already full');
      return;
    }

    console.log(`Need to generate ${codesToGenerate} short codes...`);

    let generatedCount = 0;
    const pipeline = client.pipeline();

    while (generatedCount < codesToGenerate) {
      const currentBatch = Math.min(this.batchSize, codesToGenerate - generatedCount);
      const uniqueCodes: string[] = [];

      // Batch halinde unique kod üret
      for (let i = 0; i < currentBatch * 2; i++) { // %50 fazla üret, unique olmayan olabilir
        const code = await this.shortCodeGeneratorHelper.generateShortCode();
        
        // DB'de var mı kontrol et
        const existsInDB = await this.urlRepository.findByShortCodeAsync(code);
        if (!existsInDB) {
          uniqueCodes.push(code);
          if (uniqueCodes.length >= currentBatch) break;
        }
      }

      // Redis'e ekle
      if (uniqueCodes.length > 0) {
        pipeline.rpush(this.poolKey, ...uniqueCodes);
        generatedCount += uniqueCodes.length;
        console.log(`Generated ${uniqueCodes.length} unique codes (Total: ${generatedCount})`);
      }

      // Eğer unique kod bulamadıysak biraz bekle
      if (uniqueCodes.length === 0) {
        console.warn('No unique codes found in this batch, waiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    await pipeline.exec();
    console.log(`Pool filled! Added ${generatedCount} unique short codes`);
  }
}