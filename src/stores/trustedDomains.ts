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
import { defineStore } from 'pinia';

interface TrustedDomain {
  id: string;
  domain: string;
}

interface TrustedDomainsState {
  trustedDomains: TrustedDomain[];
}

export const useTrustedDomainsStore = defineStore('trustedDomains', {
  state: (): TrustedDomainsState => ({
    trustedDomains: [],
  }),
  actions: {
    async loadTrustedDomains() {
      return new Promise<TrustedDomain[]>((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.get('trustedDomains', (result: any) => {
            if (result.trustedDomains) {
              this.trustedDomains = result.trustedDomains;
            }
            resolve(this.trustedDomains);
          });
        } else {
          resolve(this.trustedDomains);
        }
      });
    },
    async saveTrustedDomains(domains: TrustedDomain[]) {
      this.trustedDomains = domains;
      return new Promise<void>((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.set({ trustedDomains: domains }, () => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    },
  },
});

export const getTrustedDomains = async (): Promise<any[] | null> => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get('trustedDomains', (result: any) => {
        resolve(result.trustedDomains || null);
      });
    } else {
      resolve(null);
    }
  });
};

export const setTrustedDomains = async (domains: any[]): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ trustedDomains: domains }, () => {
        resolve();
      });
    } else {
      resolve();
    }
  });
};
