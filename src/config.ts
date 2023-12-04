import { get } from 'env-var';

export class Config {
  static get OPENAI_API_KEY() {
    return get('OPENAI_API_KEY').required().asString();
  }

  static get FE_BASE_URL() {
    return get('FE_BASE_URL').required().asString();
  }
}
