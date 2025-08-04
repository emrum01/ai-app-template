import { beforeAll, afterAll } from 'vitest';
import nock from 'nock';

beforeAll(() => {
  // Disable all real HTTP requests
  nock.disableNetConnect();
});

afterAll(() => {
  // Re-enable real HTTP requests
  nock.enableNetConnect();
});