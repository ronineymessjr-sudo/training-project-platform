<template>
  <view class="progress-list-page">
    <view class="page-header">
      <text class="page-title">进度提交</text>
    </view>

    <!-- 筛选 -->
    <view class="filter-section">
      <picker 
        :value="currentPhase" 
        :range="phaseOptions" 
        range-key="label"
        @change="onPhaseChange"
      >
        <view class="filter-item">
          <text>{{ phaseOptions[currentPhase]?.label || '选择阶段' }}</text>
          <text class="arrow">▼</text>
        </view>
      </picker>
    </view>

    <!-- 进度列表 -->
    <view class="progress-list">
      <view 
        class="progress-card" 
        v-for="item in progressList" 
        :key="item.id"
      >
        <view class="card-header">
          <text class="card-title">{{ item.title }}</text>
          <text class="status-tag" :class="item.status">{{ getStatusText(item.status) }}</text>
        </view>
        
        <view class="card-content">
          <text class="content-text">{{ item.content }}</text>
        </view>
        
        <view class="card-footer">
          <view class="footer-left">
            <text class="phase-tag">{{ item.phaseName }}</text>
            <text class="submit-time">{{ item.submittedAt }}</text>
          </view>
          <view class="footer-right" v-if="item.status === 'draft'">
            <button class="btn-small" @click="submitProgress(item.id)">提交</button>
          </view>
        </view>
        
        <view class="review-comment" v-if="item.reviewerComment">
          <text class="comment-label">审核意见：</text>
          <text class="comment-text">{{ item.reviewerComment }}</text>
        </view>
      </view>

      <view v-if="progressList.length === 0" class="empty-tip">
        <text>暂无进度记录</text>
      </view>
    </view>

    <!-- 添加按钮 -->
    <view class="add-btn" @click="showAddModal = true">
      <text>+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const phaseOptions = [
  { value: 0, label: '全部阶段' },
  { value: 1, label: '需求分析' },
  { value: 2, label: '系统设计' },
  { value: 3, label: '编码实现' },
  { value: 4, label: '测试部署' },
]

const currentPhase = ref(0)
const showAddModal = ref(false)
const progressList = ref<Array<{
  id: number
  title: string
  content: string
  status: string
  phaseName: string
  submittedAt: string
  reviewerComment?: string
}>>([])

onMounted(() => {
  loadProgressList()
})

function loadProgressList() {
  progressList.value = [
    {
      id: 1,
      title: '完成数据库设计',
      content: '已完成用户表、商品表、订单表的设计，绘制了ER图和数据库概念模型。',
      status: 'approved',
      phaseName: '系统设计',
      submittedAt: '2024-05-15 14:30',
      reviewerComment: '设计规范，继续加油！',
    },
    {
      id: 2,
      title: '完成前端页面框架搭建',
      content: '使用Vue3+Element Plus搭建了项目框架，完成了登录、注册、主页面布局。',
      status: 'submitted',
      phaseName: '编码实现',
      submittedAt: '2024-05-18 10:20',
    },
    {
      id: 3,
      title: '完成接口文档',
      content: '编写了详细的API接口文档，包括接口地址、请求参数、返回格式等。',
      status: 'draft',
      phaseName: '编码实现',
      submittedAt: '2024-05-20 16:45',
    },
  ]
}

function onPhaseChange(e: any) {
  currentPhase.value = e.detail.value
  loadProgressList()
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    draft: '草稿',
    submitted: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  }
  return map[status] || status
}

function submitProgress(id: number) {
  uni.showModal({
    title: '确认提交',
    content: '提交后将无法修改，确认提交吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '提交成功', icon: 'success' })
        loadProgressList()
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.progress-list-page {
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

.filter-section {
  background: #fff;
  padding: 0 24rpx 24rpx;
  
  .filter-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 24rpx;
    background: #f5f5f5;
    border-radius: 32rpx;
    font-size: 28rpx;
    
    .arrow {
      font-size: 20rpx;
      color: #999;
    }
  }
}

.progress-list {
  padding: 24rpx;
  
  .progress-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      .card-title {
        font-size: 32rpx;
        font-weight: 600;
        flex: 1;
      }
    }
    
    .card-content {
      .content-text {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
    
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24rpx;
      padding-top: 24rpx;
      border-top: 1px solid #f0f0f0;
      
      .footer-left {
        display: flex;
        align-items: center;
        gap: 16rpx;
        
        .phase-tag {
          background: #e6f7ff;
          color: #1890ff;
          padding: 4rpx 16rpx;
          border-radius: 16rpx;
          font-size: 24rpx;
        }
        
        .submit-time {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .btn-small {
        padding: 8rpx 24rpx;
        background: #1890ff;
        color: #fff;
        border-radius: 20rpx;
        font-size: 24rpx;
        border: none;
      }
    }
    
    .review-comment {
      margin-top: 16rpx;
      padding: 16rpx;
      background: #fffbe6;
      border-radius: 8rpx;
      font-size: 26rpx;
      
      .comment-label {
        color: #fa8c16;
        font-weight: 500;
      }
      
      .comment-text {
        color: #666;
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

.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 200rpx;
  width: 100rpx;
  height: 100rpx;
  background: #1890ff;
  border-radius: 50rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.4);
  
  text {
    font-size: 60rpx;
    color: #fff;
    font-weight: 300;
  }
}
</style>
