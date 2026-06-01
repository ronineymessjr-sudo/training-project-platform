<template>
  <view class="document-list-page">
    <view class="page-header">
      <text class="page-title">文档管理</text>
      <button class="upload-btn" @click="chooseFile">上传文件</button>
    </view>

    <!-- 路径导航 -->
    <view class="path-nav">
      <view 
        class="path-item" 
        v-for="(item, index) in currentPath" 
        :key="index"
        @click="navigateToPath(index)"
      >
        <text :class="{ active: index === currentPath.length - 1 }">{{ item.name }}</text>
        <text v-if="index < currentPath.length - 1" class="separator">/</text>
      </view>
    </view>

    <!-- 文件列表 -->
    <view class="file-list">
      <view 
        class="file-item" 
        v-for="item in fileList" 
        :key="item.id"
        @click="item.type === 'folder' ? enterFolder(item) : previewFile(item)"
      >
        <view class="file-icon">
          <text>{{ item.type === 'folder' ? '📁' : getFileIcon(item.mimeType) }}</text>
        </view>
        <view class="file-info">
          <text class="file-name">{{ item.name }}</text>
          <text class="file-meta">{{ item.size || '-' }} · {{ item.updatedAt }}</text>
        </view>
        <view class="file-actions" v-if="item.type !== 'folder'">
          <view class="action-btn" @click.stop="downloadFile(item)">下载</view>
        </view>
      </view>

      <view v-if="fileList.length === 0" class="empty-tip">
        <text>文件夹为空</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FileItem {
  id: number
  name: string
  type: 'file' | 'folder'
  mimeType?: string
  size?: string
  updatedAt: string
}

const currentPath = ref<Array<{ id: number | null; name: string }>>([
  { id: null, name: '全部文件' },
])

const fileList = ref<FileItem[]>([
  {
    id: 1,
    name: '需求文档',
    type: 'folder',
    updatedAt: '2024-05-15',
  },
  {
    id: 2,
    name: '设计文档',
    type: 'folder',
    updatedAt: '2024-05-18',
  },
  {
    id: 3,
    name: '开题报告.docx',
    type: 'file',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: '256 KB',
    updatedAt: '2024-05-10',
  },
  {
    id: 4,
    name: '项目计划书.pdf',
    type: 'file',
    mimeType: 'application/pdf',
    size: '1.2 MB',
    updatedAt: '2024-05-12',
  },
  {
    id: 5,
    name: '数据库设计.sql',
    type: 'file',
    mimeType: 'text/plain',
    size: '32 KB',
    updatedAt: '2024-05-14',
  },
])

function getFileIcon(mimeType?: string): string {
  if (!mimeType) return '📎'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊'
  if (mimeType.includes('image')) return '🖼️'
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦'
  return '📎'
}

function navigateToPath(index: number) {
  currentPath.value = currentPath.value.slice(0, index + 1)
  loadFolder(currentPath.value[currentPath.value.length - 1].id)
}

function enterFolder(item: FileItem) {
  currentPath.value.push({ id: item.id, name: item.name })
  loadFolder(item.id)
}

function loadFolder(folderId: number | null) {
  // 模拟加载文件夹内容
  fileList.value = folderId === 1 ? [
    { id: 11, name: '需求规格说明书.docx', type: 'file', size: '512 KB', updatedAt: '2024-05-15' },
    { id: 12, name: '原型图.zip', type: 'file', size: '8.5 MB', updatedAt: '2024-05-14' },
  ] : [
    { id: 1, name: '需求文档', type: 'folder', updatedAt: '2024-05-15' },
    { id: 2, name: '设计文档', type: 'folder', updatedAt: '2024-05-18' },
    { id: 3, name: '开题报告.docx', type: 'file', size: '256 KB', updatedAt: '2024-05-10' },
  ]
}

function chooseFile() {
  uni.chooseMessageFile({
    count: 1,
    type: 'file',
    success: (res) => {
      const file = res.tempFiles[0]
      uni.showLoading({ title: '上传中...' })
      // 模拟上传
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: '上传成功', icon: 'success' })
        fileList.value.unshift({
          id: Date.now(),
          name: file.name,
          type: 'file',
          size: formatSize(file.size),
          updatedAt: new Date().toLocaleDateString(),
        })
      }, 1000)
    },
  })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function previewFile(item: FileItem) {
  uni.showToast({ title: '预览功能开发中', icon: 'none' })
}

function downloadFile(item: FileItem) {
  uni.showToast({ title: '开始下载...', icon: 'loading' })
  setTimeout(() => {
    uni.showToast({ title: '下载完成', icon: 'success' })
  }, 1500)
}
</script>

<style lang="scss" scoped>
.document-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.page-header {
  background: #fff;
  padding: 32rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .page-title {
    font-size: 40rpx;
    font-weight: 600;
  }
  
  .upload-btn {
    padding: 12rpx 32rpx;
    background: #1890ff;
    color: #fff;
    border-radius: 32rpx;
    font-size: 26rpx;
    border: none;
  }
}

.path-nav {
  background: #fff;
  padding: 20rpx 24rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  
  .path-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    
    text {
      font-size: 26rpx;
      color: #666;
      
      &.active {
        color: #1890ff;
        font-weight: 500;
      }
    }
    
    .separator {
      color: #ccc;
    }
  }
}

.file-list {
  padding: 24rpx;
  
  .file-item {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 24rpx;
    border-radius: 16rpx;
    margin-bottom: 16rpx;
    
    .file-icon {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 48rpx;
      margin-right: 20rpx;
    }
    
    .file-info {
      flex: 1;
      
      .file-name {
        display: block;
        font-size: 30rpx;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .file-meta {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .file-actions {
      .action-btn {
        padding: 8rpx 20rpx;
        background: #f5f5f5;
        color: #666;
        border-radius: 20rpx;
        font-size: 24rpx;
      }
    }
  }
}

.empty-tip {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
