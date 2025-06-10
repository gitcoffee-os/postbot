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
<template>
    <div>
        <Card hoverable style="width: 100%;">
            <template #cover>
            <img
                alt="PostBot"
                src="https://cdn.exmay.com/exmay/exmay-app/static/images/postbot_home.png"
            />
            </template>
            <template #actions>
            <!-- <SettingOutlined key="setting" />
            <EditOutlined key="edit" />
            <EllipsisOutlined key="ellipsis" /> -->
            </template>
            <CardMeta :title="userInfo.nickname" :description="userInfo?.profile">
            <template #avatar>
                <Avatar :src="userInfo.avatarUrl" />
            </template>
            </CardMeta>
        </Card>
    </div>
  </template>
  
  <script lang="ts" setup>
    import {ref, onMounted } from 'vue'
    import 'ant-design-vue/dist/reset.css';
    // import { Button, Layout, List, Modal, Input } from "ant-design-vue"
    import { Space, Card, CardMeta, Avatar, Button } from 'ant-design-vue';
    import { SettingOutlined, EditOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design/icons-vue';

    import { userInfoApi } from '~api/media/user.api';

    const userInfo = ref({
        nickname: '',
        avatarUrl: 'https://cdn.exmay.com/exmay/exmay-app/static/images/postbot_logo.png',
        // profile: 'PostBot 同步助手',
    });

    const loadUesrInfo = async() => {
        const res = await userInfoApi({});
        const data = res.data;
        userInfo.value = data; 
    }

    onMounted(() => {
        loadUesrInfo();
    });
  </script>
  
  <style scoped>
  </style>  