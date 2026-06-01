<template>
  <view class="project-list-page">
    <view class="page-header">
      <text class="page-title">我的项目</text>
      <view class="filter-tabs">
        <view 
          v-for="tab in tabs" 
          :key="tab.value"
          :class="['tab-item', { active: currentTab === tab.value }]"
          @click="changeTab(tab.value)"
        >
          {{ tab.label }}
        </view>
      </view>
    </view>

    <view class="project-list">
      <view 
        class="project-card" 
        v-for="item in projectList" 
        :key="item.id"
        @click="goDetail(item.id)"
      >
        <view class="project-header">
          <text class="project-name">{{ item.name }}</text>
          <text class="status-tag" :class="item.status">{{ getStatusText(item.status) }}</text>
        </view>
        
        <view class="project-desc">{{ item.description }}</view>
        
        <view class="project-info">
          <view class="info-item">
            <text class="info-icon">👥</text>
            <text class="info-text">{{ item.memberCount }}人</text>
          </view>
          <view class="info-item">
            <text class="info-icon">📅</text>
            <text class="info-text">{{ item.deadline }}</text>
          </view>
        </view>
        
        <view class="project-progress">
          <view class="progress-header">
            <text class="progress-label">项目进度</text>
            <text class="progress-value">{{ item.progress }}%</text>
          </view>
          <progress 
            :percent="item.progress" 
            stroke-width="8" 
            activeColor="#1890ff"
            backgroundColor="#f0f0f0"
            borderRadius="4rpx"
          />
        </view>
      </view>

      <view v-if="projectList.length === 0" class="empty-tip">
        <text>暂无项目</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const tabs = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'progress' },
  { label: '已完成', value: 'completed' },
]

const currentTab = ref('all')
const projectList = ref<Array<{
  id: number
  name: string
  description: string
  status: string
  memberCount: number
  deadline: string
  progress: number
}>>([])

onMounted(() => {
  loadProjects()
})

function loadProjects() {
  // 模拟数据
  projectList.value = [
    {
      id: 1,
      name: '校园二手交易平台',
      description: '基于微信小程序的校园二手物品交易平台，支持发布、浏览、搜索、聊天等功能。',
      status: 'progress',
      memberCount: 4,
      deadline: '2024-06-15',
      progress: 65,
    },
    {
      id: 2,
      name: '在线考试系统',
      description: '支持多种题型、随机组卷、在线监考的在线考试系统。',
      status: 'progress',
      memberCount: 5,
      deadline: '2024-06-20',
      progress: 40,
    },
    {
      id: 3,
      name: '图书管理系统',
      description: '图书馆藏书管理、借阅管理、读者管理的综合性系统。',
      status: 'completed',
      memberCount: 3,
      deadline: '2024-04-30',
      progress: 100,
    },
  ]
}

function changeTab(tab: string) {
  currentTab.value = tab
  loadProjects()
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

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/project/detail?id=${id}` })
}
</script>

<style lang="scss" scoped>
.project-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.page-header {
  background: #fff;
  padding: 32rpx 24rpx;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .page-title {
    font-size: 40rpx;
    font-weight: 600;
    display: block;
    margin-bottom: 24rpx;
  }
  
  .filter-tabs {
    display: flex;
    gap: 24rpx;
    
    .tab-item {
      font-size: 28rpx;
      color: #666;
      padding: 8rpx 0;
      border-bottom: 4rpx solid transparent;
      transition: all 0.3s;
      
      &.active {
        color: #1890ff;
        border-bottom-color: #1890ff;
        font-weight: 500;
      }
    }
  }
}

.project-list {
  padding: 24rpx;
  
  .project-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    
    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      .project-name {
        font-size: 32rpx;
        font-weight: 600;
        flex: 1;
        margin-right: 16rpx;
      }
    }
    
    .project-desc {
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
      margin-bottom: 24rpx;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .project-info {
      display: flex;
      gap: 32rpx;
      margin-bottom: 24rpx;
      
      .info-item {
        display: flex;
        align-items: center;
        gap: 8rpx;
        
        .info-text {
          font-size: 26rpx;
          color: #999;
        }
      }
    }
    
    .project-progress {
      .progress-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12rpx;
        
        .progress-label {
          font-size: 26rpx;
          color: #666;
        }
        
        .progress-value {
          font-size: 26rpx;
          color: #1890ff;
          font-weight: 500;
        }
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
