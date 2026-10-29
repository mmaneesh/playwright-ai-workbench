import { mergeTests } from '@playwright/test';
import { test as uiTest } from './ui.fixture';
import { test as apiTest } from './api.fixture';

export const test = mergeTests(uiTest, apiTest);
export { expect } from '@playwright/test';
