import { Injectable } from '@nestjs/common';
import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';
import {
  LiveRecommendationsFlagStrategy,
} from 'src/modules/feature/providers/feature-flag/strategies/live-recommendations.flag.strategy';
import { DefaultFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/default.flag.strategy';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';

@Injectable()
export class FeatureFlagProvider {
  private strategies: Map<string, FeatureFlagStrategy> = new Map();

  constructor(
    private readonly featuresConfigService: FeaturesConfigService,
  ) {
    this.strategies.set('default', new DefaultFlagStrategy(this.featuresConfigService));
    this.strategies.set('liveRecommendations', new LiveRecommendationsFlagStrategy(this.featuresConfigService));
  }

  getStrategy(name: string): FeatureFlagStrategy {
    return this.strategies.get(name) || this.getStrategy('default');
  }

  calculate(name: string, featureConditions: any): Promise<boolean> {
    const strategy = this.getStrategy(name);

    return strategy.calculate(featureConditions);
  }
}
