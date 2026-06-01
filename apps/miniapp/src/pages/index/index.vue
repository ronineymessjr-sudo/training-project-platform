<template>
  <view class="index-page">
    <!-- 顶部欢迎 -->
    <view class="welcome-section">
      <view class="welcome-text">
        <text class="greeting">你好，{{ userInfo?.name || '用户' }}</text>
        <text class="subtitle">今天是学习的好时光~</text>
      </view>
      <view class="avatar" @click="goProfile">
        <image :src="userInfo?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-entry card">
      <view class="section-title">快捷入口</view>
      <view class="entry-grid">
        <view class="entry-item" @click="goPage('/pages/project/list')">
          <view class="entry-icon" style="background: #e6f7ff;">
            <text class="iconfont">📋</text>
          </view>
          <text class="entry-text">我的项目</text>
        </view>
        <view class="entry-item" @click="goPage('/pages/group/list')">
          <view class="entry-icon" style="background: #f6ffed;">
            <text class="iconfont">👥</text>
          </view>
          <text class="entry-text">我的小组</text>
        </view>
        <view class="entry-item" @click="goPage('/pages/progress/list')">
          <view class="entry-icon" style="background: #fff7e6;">
            <text class="iconfont">📊</text>
          </view>
          <text class="entry-text">提交进度</text>
        </view>
        <view class="entry-item" @click="goPage('/pages/document/list')">
          <view class="entry-icon" style="background: #fff1f0;">
            <text class="iconfont">📁</text>
          </view>
          <text class="entry-text">文档管理</text>
        </view>
      </view>
    </view>

    <!-- 统计数据 -->
    <view class="stats-section">
      <view class="stat-card">
        <view class="stat-value">{{ stats.projectCount }}</view>
        <view class="stat-label">我的项目</view>
      </view>
      <view class="stat-card">
        <view class="stat-value">{{ stats.groupCount }}</view>
        <view class="stat-label">我的小组</view>
      </view>
      <view class="stat-card">
        <view class="stat-value">{{ stats.pendingTask }}</view>
        <view class="stat-label">待完成</view>
      </view>
    </view>

    <!-- 最新项目 -->
    <view class="card">
      <view class="flex-between mb-16">
        <text class="section-title" style="margin-bottom: 0;">最近项目</text>
        <text class="more-link" @click="goPage('/pages/project/list')">查看全部 ></text>
      </view>
      <view class="project-list">
        <view 
          class="project-item" 
          v-for="item in recentProjects" 
          :key="item.id"
          @click="goProjectDetail(item.id)"
        >
          <view class="project-info">
            <view class="project-name">{{ item.name }}</view>
            <view class="project-meta">
              <text class="status-tag" :class="item.status">{{ getStatusText(item.status) }}</text>
              <text class="project-deadline">截止 {{ item.deadline }}</text>
            </view>
          </view>
          <view class="project-progress">
            <progress 
              :percent="item.progress" 
              stroke-width="6" 
              activeColor="#1890ff"
              backgroundColor="#f0f0f0"
            />
            <text class="progress-text">{{ item.progress }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 最新公告 -->
    <view class="card">
      <view class="flex-between mb-16">
        <text class="section-title" style="margin-bottom: 0;">最新公告</text>
      </view>
      <view class="announcement-list">
        <view 
          class="announcement-item" 
          v-for="item in announcements" 
          :key="item.id"
          @click="goAnnouncementDetail(item.id)"
        >
          <view class="announcement-title">{{ item.title }}</view>
          <view class="announcement-time">{{ item.createdAt }}</view>
        </view>
        <view v-if="announcements.length === 0" class="empty-tip">
          暂无公告
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const userInfo = ref<{ name: string; avatar: string } | null>(null)
const stats = ref({
  projectCount: 0,
  groupCount: 0,
  pendingTask: 0,
})
const recentProjects = ref<Array<{
  id: number
  name: string
  status: string
  progress: number
  deadline: string
}>>([])
const announcements = ref<Array<{
  id: number
  title: string
  createdAt: string
}>>([])

onMounted(() => {
  loadUserInfo()
  loadData()
})

function loadUserInfo() {
  const userData = uni.getStorageSync('userInfo')
  if (userData) {
    userInfo.value = JSON.parse(userData)
  }
}

function loadData() {
  // 模拟数据
  stats.value = {
    projectCount: 2,
    groupCount: 1,
    pendingTask: 3,
  }
  recentProjects.value = [
    {
      id: 1,
      name: '校园二手交易平台',
      status: 'progress',
      progress: 65,
      deadline: '2024-06-15',
    },
    {
      id: 2,
      name: '在线考试系统',
      status: 'progress',
      progress: 40,
      deadline: '2024-06-20',
    },
  ]
  announcements.value = [
    {
      id: 1,
      title: '关于2024年实训项目答辩安排的通知',
      createdAt: '2024-05-20',
    },
    {
      id: 2,
      title: '实训项目中期检查通知',
      createdAt: '2024-05-18',
    },
  ]
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待开始',
    progress: '进行中',
    submitted: '已提交',
    defended: '已答辩',
    completed: '已完成',
  }
  return map[status] || status
}

function goPage(url: string) {
  uni.navigateTo({ url })
}

function goProjectDetail(id: number) {
  uni.navigateTo({ url: `/pages/project/detail?id=${id}` })
}

function goAnnouncementDetail(id: number) {
  uni.navigateTo({ url: `/pages/announcement/detail?id=${id}` })
}

function goProfile() {
  uni.switchTab({ url: '/pages/profile/profile' })
}
</script>

<style lang="scss" scoped>
.index-page {
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  
  .greeting {
    display: block;
    font-size: 36rpx;
    font-weight: 600;
    color: #fff;
  }
  
  .subtitle {
    display: block;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 8rpx;
  }
  
  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    overflow: hidden;
    border: 4rpx solid rgba(255, 255, 255, 0.5);
    
    image {
      width: 100%;
      height: 100%;
    }
  }
}

.quick-entry {
  .entry-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24rpx;
  }
  
  .entry-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .entry-icon {
      width: 96rpx;
      height: 96rpx;
      border-radius: 24rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 12rpx;
      
      .iconfont {
        font-size: 48rpx;
      }
    }
    
    .entry-text {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.stats-section {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
  
  .stat-card {
    flex: 1;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    text-align: center;
    
    .stat-value {
      font-size: 40rpx;
      font-weight: 600;
      color: #1890ff;
    }
    
    .stat-label {
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }
}

.project-list {
  .project-item {
    padding: 24rpx 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .project-name {
      font-size: 30rpx;
      font-weight: 500;
      margin-bottom: 12rpx;
    }
    
    .project-meta {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 12rpx;
      
      .project-deadline {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .project-progress {
      display: flex;
      align-items: center;
      gap: 16rpx;
      
      progress {
        flex: 1;
      }
      
      .progress-text {
        font-size: 24rpx;
        color: #1890ff;
        min-width: 80rpx;
        text-align: right;
      }
    }
  }
}

.more-link {
  font-size: 26rpx;
  color: #1890ff;
}

.announcement-list {
  .announcement-item {
    padding: 20rpx 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .announcement-title {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 8rpx;
    }
    
    .announcement-time {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 40rpx 0;
}
</style>
