/**
 * Copyright (c) 2025-2099 GitCoffee All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Storage } from '@plasmohq/storage'

const storage = new Storage({ area: 'local' });

const TRUSTE_DOMAINS = 'TPOSTBOT_RUSTE_DOMAINS';

export const setTrustedDomains = async (domains) => {
  await storage.set(TRUSTE_DOMAINS, domains)
}

export const getTrustedDomains = async () => {
  const token = await storage.get(TRUSTE_DOMAINS)
  console.log('trustedDomains', token)
  return token
}