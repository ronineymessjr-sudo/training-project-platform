<template>
  <view class="project-detail-page">
    <view class="page-header">
      <text class="page-title">项目详情</text>
    </view>

    <!-- 项目信息 -->
    <view class="project-info card">
      <view class="info-header">
        <text class="project-name">{{ project.name }}</text>
        <text class="status-tag" :class="project.status">{{ getStatusText(project.status) }}</text>
      </view>
      <view class="info-desc">{{ project.description }}</view>
      <view class="info-meta">
        <view class="meta-item">
          <text class="meta-icon">👥</text>
          <text class="meta-text">{{ project.memberCount }}人</text>
        </view>
        <view class="meta-item">
          <text class="meta-icon">📅</text>
          <text class="meta-text">截止 {{ project.deadline }}</text>
        </view>
      </view>
    </view>

    <!-- 进度 -->
    <view class="progress-section card">
      <view class="section-title">项目进度</view>
      <view class="progress-bar">
        <progress 
          :percent="project.progress" 
          stroke-width="10" 
          activeColor="#1890ff"
          backgroundColor="#f0f0f0"
          borderRadius="5rpx"
        />
        <text class="progress-text">{{ project.progress }}%</text>
      </view>
    </view>

    <!-- 阶段 -->
    <view class="phases-section card">
      <view class="section-title">项目阶段</view>
      <view class="phase-list">
        <view 
          class="phase-item" 
          v-for="(phase, index) in project.phases" 
          :key="phase.id"
          :class="{ active: index === currentPhaseIndex, completed: phase.status === 'completed' }"
        >
          <view class="phase-dot">
            <text v-if="phase.status === 'completed'">✓</text>
            <text v-else>{{ index + 1 }}</text>
          </view>
          <view class="phase-content">
            <text class="phase-name">{{ phase.name }}</text>
            <text class="phase-date">{{ phase.deadline }}</text>
          </view>
          <text class="phase-status">{{ getPhaseStatus(phase.status) }}</text>
        </view>
      </view>
    </view>

    <!-- 成员 -->
    <view class="members-section card">
      <view class="section-title">小组成员</view>
      <view class="member-list">
        <view class="member-item" v-for="member in project.members" :key="member.id">
          <image class="member-avatar" :src="member.avatar || '/static/default-avatar.png'" mode="aspectFill" />
          <view class="member-info">
            <text class="member-name">{{ member.name }}</text>
            <text class="member-role">{{ member.role === 'leader' ? '组长' : '组员' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const project = ref<{
  id: number
  name: string
  description: string
  status: string
  memberCount: number
  deadline: string
  progress: number
  phases: Array<{
    id: number
    name: string
    deadline: string
    status: string
  }>
  members: Array<{
    id: number
    name: string
    role: string
    avatar?: string
  }>
}>({
  id: 1,
  name: '校园二手交易平台',
  description: '基于微信小程序的校园二手物品交易平台，支持发布、浏览、搜索、聊天、交易等功能。',
  status: 'progress',
  memberCount: 4,
  deadline: '2024-06-15',
  progress: 65,
  phases: [
    { id: 1, name: '需求分析', deadline: '2024-03-31', status: 'completed' },
    { id: 2, name: '系统设计', deadline: '2024-04-30', status: 'completed' },
    { id: 3, name: '编码实现', deadline: '2024-05-31', status: 'in_progress' },
    { id: 4, name: '测试部署', deadline: '2024-06-15', status: 'pending' },
  ],
  members: [
    { id: 1, name: '张三', role: 'leader', avatar: '/static/default-avatar.png' },
    { id: 2, name: '李四', role: 'member', avatar: '/static/default-avatar.png' },
    { id: 3, name: '王五', role: 'member', avatar: '/static/default-avatar.png' },
    { id: 4, name: '赵六', role: 'member', avatar: '/static/default-avatar.png' },
  ],
})

const currentPhaseIndex = computed(() => {
  return project.value.phases.findIndex(p => p.status === 'in_progress')
})

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

function getPhaseStatus(status: string): string {
  const map: Record<string, string> = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
  }
  return map[status] || status
}
</script>

<style lang="scss" scoped>
.project-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.page-header {
  background: #fff;
  padding: 32rpx 24rpx;
  
  .page-title {
    font-size: 40rpx;
    font-weight: 600;
  }
}

.card {
  background: #fff;
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  
  .project-name {
    font-size: 36rpx;
    font-weight: 600;
    flex: 1;
    margin-right: 16rpx;
  }
}

.info-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 24rpx;
}

.info-meta {
  display: flex;
  gap: 32rpx;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    
    .meta-text {
      font-size: 26rpx;
      color: #999;
    }
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 20rpx;
  
  progress {
    flex: 1;
  }
  
  .progress-text {
    font-size: 28rpx;
    color: #1890ff;
    font-weight: 600;
    min-width: 80rpx;
  }
}

.phase-list {
  .phase-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .phase-dot {
      width: 48rpx;
      height: 48rpx;
      border-radius: 24rpx;
      background: #f0f0f0;
      color: #999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24rpx;
      margin-right: 20rpx;
    }
    
    &.completed .phase-dot {
      background: #52c41a;
      color: #fff;
    }
    
    &.active .phase-dot {
      background: #1890ff;
      color: #fff;
    }
    
    .phase-content {
      flex: 1;
      
      .phase-name {
        display: block;
        font-size: 28rpx;
        color: #333;
      }
      
      .phase-date {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .phase-status {
      font-size: 24rpx;
      color: #999;
    }
    
    &.active .phase-status {
      color: #1890ff;
    }
    
    &.completed .phase-status {
      color: #52c41a;
    }
  }
}

.member-list {
  .member-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    
    .member-avatar {
      width: 64rpx;
      height: 64rpx;
      border-radius: 32rpx;
      margin-right: 16rpx;
    }
    
    .member-info {
      .member-name {
        display: block;
        font-size: 28rpx;
        color: #333;
      }
      
      .member-role {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}
</style>
