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
import { BASE_URL } from "~config/config";

export const isLoginApi = async(params) => {
    const response = await fetch(`${BASE_URL}/exmay/api/ums/member/islogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(params),
      });
      if (response.ok) {
        const body = await response.json();
        return body;
      }
      return null;
}

export const userInfoApi = async(params) => {
  const response = await fetch(`${BASE_URL}/exmay/api/member/center/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (response.ok) {
      const body = await response.json();
      return body;
    }
    return null;
}