import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly logo: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.getByAltText('Inicio Banco Pichincha').filter({ visible: true }).first();
  }

  async open(): Promise<void> {
    await this.goto('/');
  }
}
